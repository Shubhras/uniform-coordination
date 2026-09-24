from django.conf import settings
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve
from drf_spectacular.views import (SpectacularAPIView,SpectacularSwaggerView,SpectacularRedocView,)

urlpatterns = [
    path('admin/', admin.site.urls),
        # ===== Swagger / OpenAPI =====
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/swagger/",SpectacularSwaggerView.as_view(url_name="schema"),name="swagger-ui",),
    path("api/docs/redoc/",SpectacularRedocView.as_view(url_name="schema"),name="redoc",),
    path('api/v1/uniformAdmin/', include('uniformAdmin.urls')),
    path('api/v1/space/uniformAdmin/', include('uniformAdmin.urls')),
    path('api/v1/userhub/', include('userhub.urls')),
    path('api/v1/space/userhub/', include('userhub.urls')),
    #path('api/v1/contracts/', include('contracts.urls')),
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
