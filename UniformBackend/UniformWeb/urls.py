from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/uniformAdmin/', include('uniformAdmin.urls')),
    path('api/v1/userhub/', include('userhub.urls'))
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)





# from django.conf import settings
# from django.conf.urls.static import static
# from django.contrib import admin
# from django.urls import path, include, re_path

# from rest_framework import permissions
# from drf_yasg.views import get_schema_view
# from drf_yasg import openapi

# schema_view = get_schema_view(
#    openapi.Info(
#       title="Your API Name",
#       default_version='v1',
#       description="API documentation for your project",
#    ),
#    public=True,
#    permission_classes=[permissions.AllowAny],
# )

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api/v1/uniformAdmin/', include('uniformAdmin.urls')),
#     path('api/v1/userhub/', include('userhub.urls')),

#     # Swagger UI
#    re_path(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),

#    # ReDoc UI
#    re_path(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

# ]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
