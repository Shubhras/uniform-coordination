from django.urls import path
from uniformAdmin.views import *
from .fabric import *
from .parts import *
from .colours import *
from .templates import *

urlpatterns = [
    path('login/', AdminLoginAPIView.as_view(), name='admin-login'),
    path('change-password/', AdminChangePasswordAPIView.as_view(), name='admin-change-password'),
    path('update-profile/', AdminUpdateProfileAPIView.as_view(), name='admin-change-password'),
    path('profile/', AdminDetailAPIView.as_view(), name='admin-details'),
    path('logout/', AdminLogoutAPIView.as_view(), name='admin-details'),
    path('forgot-password/', AdminForgotPasswordAPIView.as_view(), name='forgot-password'),

    # Fabric URLs
    path('fabric/create/', FabricCreateView.as_view()),
    path('fabric/list/', FabricListView.as_view()),
    path('fabric/<int:pk>/', FabricDetailView.as_view()),
    path('fabric/update/<int:pk>/', FabricUpdateView.as_view()),
    path('fabric/delete/<int:pk>/', FabricDeleteView.as_view()),

    # Parts URLs
    path("parts/list/", PartsListView.as_view()),
    path("parts/create/", PartsCreateView.as_view()),
    path("parts/<int:pk>/", PartsDetailView.as_view()),
    path("parts/update/<int:pk>/", PartsUpdateView.as_view()),
    path("parts/delete/<int:pk>/", PartsDeleteView.as_view()),
    # path("parts/<int:pk>/restore/", PartsRestoreView.as_view()),

    # Colours URLs
    path("colors/create/", ColorsCreateView.as_view(), name="create-color"),
    path("colors/list/", ColorsListView.as_view(), name="list-colors"),
    path("colors/<int:id>/", ColorsDetailView.as_view(), name="get-color"),
    path("colors/update/<int:id>/", ColorsUpdateView.as_view(), name="update-color"),
    path("colors/delete/<int:id>/", ColorsDeleteView.as_view(), name="delete-color"),

    # Template URLs
    path("templates/create/", TemplateCreateView.as_view(), name="create-template"),
    path("templates/list/", TemplateListView.as_view(), name="list-templates"),
    path("templates/<int:id>/", TemplateDetailView.as_view(), name="get-template"),
    path("templates/update/<int:id>/", TemplateUpdateView.as_view(), name="update-template"),
    path("templates/delete/<int:id>/", TemplateDeleteView.as_view(), name="delete-template"),

]
