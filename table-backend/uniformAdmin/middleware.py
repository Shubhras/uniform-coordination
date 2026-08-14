import json
from django.utils import translation
from .translations import localize_data

class APILanguageMiddleware:
    """
    Middleware to detect language preference from incoming API requests.
    Supports:
    1. Query Parameter: ?lang=ja or ?lang=en
    2. Cookie: locale=ja or locale=en (Set by admin frontend top-right selector)
    3. Header: Accept-Language: ja or Accept-Language: ja-JP...
    Defaults to 'en' if unspecified or unsupported.
    Translates outgoing API response messages & data values dynamically when 'ja' requested.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. Check explicit query parameter
        lang = request.GET.get('lang')
        
        # 2. Check cookies (e.g. locale=ja set by frontend)
        if not lang:
            cookie_locale = request.COOKIES.get('locale') or request.COOKIES.get('NEXT_LOCALE')
            if cookie_locale:
                lang = cookie_locale.strip().lower()

        # 3. Check HTTP Accept-Language header
        if not lang:
            accept_lang = request.headers.get('Accept-Language', 'en')
            if accept_lang:
                # Take first preference before comma/semicolon (e.g. 'ja-JP' -> 'ja')
                lang = accept_lang.split(',')[0].split(';')[0].split('-')[0].strip().lower()

        # Supported languages: 'en' (default) and 'ja'
        selected_lang = lang if lang in ['en', 'ja'] else 'en'

        # Activate locale for the current request thread
        translation.activate(selected_lang)
        request.LANGUAGE_CODE = selected_lang

        response = self.get_response(request)

        # Dynamically localize outgoing DRF Response data & content if Japanese requested
        if selected_lang == 'ja':
            if hasattr(response, 'data') and response.data is not None:
                response.data = localize_data(response.data, 'ja')
                # If DRF already rendered response.content before middleware ran, force re-render!
                if getattr(response, '_is_rendered', False):
                    response._is_rendered = False
                    try:
                        response.render()
                    except Exception:
                        pass

            if hasattr(response, 'content') and response.content:
                try:
                    content_str = response.content.decode('utf-8')
                    content_json = json.loads(content_str)
                    localized_json = localize_data(content_json, 'ja')
                    response.content = json.dumps(localized_json, ensure_ascii=False).encode('utf-8')
                    if 'Content-Length' in response:
                        response['Content-Length'] = str(len(response.content))
                except Exception:
                    pass

        # Clean up locale activation
        translation.deactivate()
        return response
