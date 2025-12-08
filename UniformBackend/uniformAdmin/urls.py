from django.urls import path
from uniformAdmin.views import *

urlpatterns = [
    path('login/', AdminLoginAPIView.as_view(), name='admin-login'),
    path('change-password/', AdminChangePasswordAPIView.as_view(), name='admin-change-password'),
    path('admin-update-profile/', AdminUpdateProfileAPIView.as_view(), name='admin-change-password'),
    path('admin/details/', AdminDetailAPIView.as_view(), name='admin-details'),
    path('logout/', AdminLogoutAPIView.as_view(), name='admin-details'),

]
