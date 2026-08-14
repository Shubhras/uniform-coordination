import urllib.request
import urllib.parse
import json
import re
from django.utils import translation

TRANSLATION_CACHE = {}

SKIP_KEYS = {
    'id', 'pk', 'user_id', 'product_id', 'order_id', 'slug', 'email', 'user_email',
    'created_at', 'updated_at', 'timestamp', 'date', 'image', 'image_url', 'file',
    'colorCode', 'hex', 'code', 'status_code', 'statusCode', 'url', 'path',
    'access_token', 'refresh_token', 'token', 'type', 'is_active', 'isActive'
}

# Curated fast-path backend translation dictionary (English -> Japanese)
RESPONSE_TRANSLATIONS = {
    # System & API Feedback Messages
    "Product created successfully.": "商品を正常に作成しました。",
    "Product updated successfully.": "商品を正常に更新しました。",
    "Product fetched successfully.": "商品情報を正常に取得しました。",
    "Products fetched successfully.": "商品一覧を正常に取得しました。",
    "Product list fetched successfully.": "商品一覧を正常に取得しました。",
    "Product deleted successfully.": "商品を正常に削除しました。",
    "Product not found.": "商品が見つかりません。",
    "Server error while creating product.": "商品の作成中にサーバーエラーが発生しました。",
    "Server error while updating product.": "商品の更新中にサーバーエラーが発生しました。",
    "Server error while fetching product.": "商品情報の取得中にサーバーエラーが発生しました。",
    "Server error while fetching products.": "商品一覧の取得中にサーバーエラーが発生しました。",
    "Server error while deleting product.": "商品の削除中にサーバーエラーが発生しました。",
    "Validation failed.": "検証に失敗しました。",
    "productType is required either 'uniform' or 'table'.": "productType（'uniform' または 'table'）は必須です。",

    # Blog API Feedback Messages
    "Blog list fetched successfully.": "ブログ一覧を正常に取得しました。",
    "Blog created successfully.": "ブログを正常に作成しました。",
    "Blog updated successfully.": "ブログを正常に更新しました。",
    "Blog details fetched successfully.": "ブログ詳細を正常に取得しました。",
    "Blog deleted successfully.": "ブログを正常に削除しました。",
    "Blog not found.": "ブログが見つかりません。",

    # Category / Subcategory
    "Category list fetched successfully.": "カテゴリー一覧を正常に取得しました。",
    "Category created successfully.": "カテゴリーを正常に作成しました。",
    "Category updated successfully.": "カテゴリーを正常に更新しました。",
    "Category fetched successfully.": "カテゴリー情報を正常に取得しました。",
    "Category deleted successfully.": "カテゴリーを正常に削除しました。",
    "Category not found.": "カテゴリーが見つかりません。",
    "Subcategory created successfully.": "サブカテゴリーを正常に作成しました。",
    "Subcategory updated successfully.": "サブカテゴリーを正常に作成しました。",
    "Subcategory fetched successfully.": "サブカテゴリー情報を正常に取得しました。",
    "Subcategory deleted successfully.": "サブカテゴリーを正常に削除しました。",
    "Subcategory not found.": "サブカテゴリーが見つかりません。",

    # Fabric API Messages
    "Fabric list fetched successfully": "生地一覧を正常に取得しました",
    "Fabric created successfully": "生地を正常に作成しました",
    "Fabric fetched successfully": "生地情報を正常に取得しました",
    "Fabric updated successfully": "生地を正常に更新しました",
    "Fabric soft-deleted successfully": "生地を正常に削除しました",
    "Fabric not found": "生地が見つかりません",

    # Blog Titles
    "Elegant Event Dining: Where Luxury Meets Timeless Design": "エレガントなイベントダイニング: ラグジュアリーとタイムレスデザインの融合",
    "Timeless Elegance: Designing Sophisticated Dining Spaces for Memorable Gatherings": "タイムレスエレガンス: 記憶に残る集いのための洗練されたダイニング空間",
    "Elegant Blue Dining Spaces: Creating a Luxurious Restaurant Ambience": "エレガントブルーダイニング空間: 高級感あふれるレストラン空間の演出",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.": "質の高いダイニング空間の創造とインテリアの美学",

    # Categories, Materials & Attributes Data Values
    "Restaurant": "レストラン",
    "Wedding": "ウェディング",
    "Office": "オフィス",
    "Medical & Nursing Care": "医療・介護",
    "Clinical Staff Wear": "臨床スタッフウェア",
    "Professional Lab Coats": "プロ用白衣",
    "Warm Elegance": "ウォームエレガンス",
    "Corporate": "企業・法人",
    "AAAAAAA": "カスタム設定",
    "Polyster": "ポリエステル",
    "Polyester": "ポリエステル",
    "Nylon": "ナイロン",
    "Cotton": "コットン",
    "Silk": "シルク",
    "silk": "シルク",
    "Linen": "麻・リネン",
    "Tablecloths": "テーブルクロス",
    "Test Tablecloths": "テストテーブルクロス",
    "Test Luxury Tablecloth": "テスト高級テーブルクロス",
    "Chair Cover": "チェアカバー",
    "Chair Covers": "チェアカバー",
    "Napkins": "ナプキン",
    "Center Piece": "センターピース",
    "Chair": "椅子",
    "Satin": "サテン",
    "Wool": "ウール",
    "Uniform": "ユニフォーム",
    "uniform": "ユニフォーム",
    "Table": "テーブル",
    "table": "テーブル",
    "premium": "プレミアム",

    # Colors
    "Yellow": "イエロー",
    "yellow": "イエロー",
    "White": "ホワイト",
    "white": "ホワイト",
    "Green": "グリーン",
    "green": "グリーン",
    "Pink": "ピンク",
    "pink": "ピンク",
    "Orange": "オレンジ",
    "orange": "オレンジ",
    "Blue": "ブルー",
    "blue": "ブルー",
    "Red": "レッド",
    "red": "レッド",
    "Black": "ブラック",
    "black": "ブラック",
    "White (Copy)": "ホワイト (コピー)",
    "Pink (Copy)": "ピンク (コピー)",

    # Shapes
    "Oval": "オーバル",
    "oval": "オーバル",
    "Rectangle": "長方形",
    "rectangle": "長方形",
    "Square": "スクエア",
    "square": "スクエア",
    "Round": "ラウンド",
    "round": "ラウンド",

    # Attributes (Simulation & Products)
    "Fabric": "生地",
    "Fit Type": "フィットタイプ",
    "Color": "カラー",
    "Closure": "クロージャー",
    "Stretch": "ストレッチ",
    "Material": "素材",
    "Size": "サイズ",
    "Style": "スタイル",
    "Shape": "形状",

    # Common Operation Responses
    "Data fetched successfully.": "データを正常に取得しました。",
    "Created successfully.": "正常に作成しました。",
    "Updated successfully.": "正常に更新しました。",
    "Deleted successfully.": "正常に削除しました。",
    "Something went wrong on server.": "サーバーでエラーが発生しました。",
    "Invalid data": "無効なデータです。",
    "Authentication failed": "認証に失敗しました。"
}

def auto_translate(text: str, target_lang='ja') -> str:
    """
    Translates any dynamic text automatically using Google Translate API with caching.
    Ensures newly created database entries in English are dynamically translated to Japanese.
    """
    if not text or not isinstance(text, str):
        return text
    text_str = text.strip()
    if not text_str or text_str.startswith(('http://', 'https://', 'data:', '/media/', 'HEX:', '#')):
        return text
    if re.match(r'^[0-9\.\-\s\/]+$', text_str):
        return text

    if text_str in RESPONSE_TRANSLATIONS:
        return RESPONSE_TRANSLATIONS[text_str]

    if text_str in TRANSLATION_CACHE:
        return TRANSLATION_CACHE[text_str]

    try:
        url = f'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl={target_lang}&dt=t&q=' + urllib.parse.quote(text_str)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as resp:
            res_data = json.loads(resp.read().decode('utf-8'))
            translated = ''.join([item[0] for item in res_data[0] if item[0]])
            if translated:
                TRANSLATION_CACHE[text_str] = translated
                return translated
    except Exception:
        pass

    return text

def get_localized_msg(request_or_lang, english_text: str) -> str:
    if hasattr(request_or_lang, 'LANGUAGE_CODE'):
        lang = getattr(request_or_lang, 'LANGUAGE_CODE', 'en')
    elif isinstance(request_or_lang, str):
        lang = request_or_lang
    else:
        lang = translation.get_language() or 'en'

    if lang == 'ja':
        return auto_translate(english_text, 'ja')
    
    return english_text

def localize_data(data, lang='en'):
    """
    Recursively translates outgoing API JSON responses for lang == 'ja'.
    Uses static dictionary fast-path and dynamic auto-translation for new user entries.
    """
    if lang != 'ja' or not data:
        return data

    if isinstance(data, str):
        if data in RESPONSE_TRANSLATIONS:
            return RESPONSE_TRANSLATIONS[data]

        # Full blog descriptions complete replacement
        if "Create unforgettable moments in a venue" in data:
            return "エレガンス、快適さ、そして現代的な洗練さを兼ね備えた空間で、忘れられない特別なひとときを演出します。この洗練されたダイニング空間には、豪華なテーブルセッティングを施した円形テーブル、新鮮な生花のセンターピース、クラシックなブラックチェア、そして気品を添えるシャンデリアが美しく配置されています。大きな天井までの窓から自然光が差し込み、あらゆるイベントに明るく魅力的な雰囲気を作り出します。"

        if "A beautifully curated dining space sets the tone" in data:
            return "洗練されたダイニング空間は、忘れられないお祝いや最高のおもてなしの雰囲気を創り出します。生花のセンターピース、エレガントな黒の椅子、クリスタルシャンデリア、大きなガラス窓を備えたラウンドテーブルが、モダンなシンプルさとタイムレスな洗練を融合させています。豊富な自然光と上質なインテリアが、明るく温かい雰囲気を作り出し、ウェディングやプライベートイベント、ファインダイニング、高級な記念式典に最適です。"

        if "A thoughtfully designed dining space can transform" in data:
            return "趣向を凝らしたダイニングデザインは、毎回の食事を特別な体験へと変える力を持っています。このエレガントなレストランのインテリアは、洗練されたブルーの布張り椅子、天井からのドレープカーテン、温かみのあるフローリング、部屋全体を明るく照らす大きな窓が特徴です。モダンな家具とタイムレスな装飾の組み合わせが、豪華でありながら居心地の良い空間を生み出します。"

        if "Lorem ipsum dolor sit amet, consectetur adipiscing" in data:
            return "洗練されたファブリックとインテリアによる空間演出。高品質な生地と洗練されたアイテムで,あらゆる空間を優雅に演出するための完全ガイドです。KIREIZU UNIFORMのカスタム制服およびテーブル装飾をご注文いただくことで、お客様に最高品質のサービスと洗練された空間コーディネートを提供いたします。"

        # Dynamic Month name translation
        month_map = {
            "Jan": "1月", "Feb": "2月", "Mar": "3月", "Apr": "4月",
            "May": "5月", "Jun": "6月", "Jul": "7月", "Aug": "8月",
            "Sep": "9月", "Oct": "10月", "Nov": "11月", "Dec": "12月"
        }
        for eng_m, jpn_m in month_map.items():
            if eng_m in data:
                data = data.replace(eng_m, jpn_m)

        return auto_translate(data, 'ja')

    elif isinstance(data, list):
        return [localize_data(item, lang) for item in data]

    elif isinstance(data, dict):
        new_dict = {}
        for key, value in data.items():
            if key in SKIP_KEYS or key.endswith(('_id', '_url', '_at', '_code', '_path')):
                new_dict[key] = value
            else:
                new_dict[key] = localize_data(value, lang)
        return new_dict

    return data
