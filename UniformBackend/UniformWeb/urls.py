
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/uniformAdmin/', include('uniformAdmin.urls')),
    path('api/v1/userhub/', include('userhub.urls'))
]
