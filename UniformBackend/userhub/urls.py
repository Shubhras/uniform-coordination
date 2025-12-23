from django.urls import path
from .views import *


urlpatterns = [
    path('signup/', SignupAPIView.as_view(), name='user-signup'),
    path('login/', LoginAPIView.as_view(), name="user-login"),
     
    path("profile/", GetProfileAPIView.as_view(), name="get_profile"),
    path("profile/update/", UpdateProfileAPIView.as_view(), name="update_profile"),
    path("profile/delete/", DeleteProfileAPIView.as_view(), name="delete_profile"),

    path("forgot-password/", ForgotPasswordAPIView.as_view(), name="forgot_password"),
    path("reset-password/", ResetPasswordAPIView.as_view(), name="reset_password"),
    path("update-password/", UpdatePasswordAPIView.as_view(), name="update-password"),
    path("verify-user/", VerifyUserAPIView.as_view(), name="verify-user"),
    # path("verify-email/<uid>/", VerifyEmailAPIView.as_view())

    # path("reset-password-page/", ResetPasswordPageView.as_view(), name="reset-password-page"),

    # path("simulations-history",name="simulations-history")

    
    # path("notifications/create/", NotificationCreateAPIView.as_view()),
    # path("notifications/", NotificationListAPIView.as_view()),
    # path("notifications/<int:pk>/", NotificationDetailAPIView.as_view()),
    # path("notifications/<int:pk>/update/", NotificationUpdateAPIView.as_view()),
    # path("notifications/<int:pk>/delete/", NotificationDeleteAPIView.as_view()),
    
    #<-------------------Model_Info------------------------------->
    path('modelinfo/create/',ModelInfoCreateAPIView.as_view(), name = 'model_info-create'),
    path('modelinfo/get-list/',ModelInfoListAPIView.as_view(), name = 'model_info-list'),
    path('modelinfo/<int:id>/get/',ModelInfoDetailAPIView.as_view(), name = 'model_info-get'),
    path('modelinfo/<int:id>/update/',ModelInfoUpdateAPIView.as_view(), name = 'model_info-update'),
    path('modelinfo/delete/',ModelInfoDeleteAPIView.as_view(), name = 'model_info-delete'),

    #<------------------------CustomUpdateModel---------------------->
    path('customupdatemodel/create/',CustomUpdateModelCreateAPIView.as_view(), name = 'custom-create'),
    path('customupdatemodel/get-list/',CustomUpdateModelListAPIView.as_view(), name = 'custom-get-list'),
    path('customupdatemodel/<int:id>/get/',CustomUpdateModelDetailAPIView.as_view(), name = 'custom-get'),
    path('customupdatemodel/<int:id>/update/',CustomUpdateModelUpdateAPIView.as_view(), name = 'custom-update'),
    path('customupdatemodel/delete/',CustomUpdateModelDeleteAPIView.as_view(), name = 'custom-delete'),
    path('customupdatemodel/<int:customization_id>/export/',CustomUpdateModelExportPDFAPIView.as_view(), name = 'custom-get'),
    
    #<-----------------------------QuotationRequest-------------------->
    path('quotationrequest/create/',QuotationRequestCreateAPIView.as_view(), name = 'QuotationRequest-create'),
    path('quotationrequest/<uuid:uuid>/get/',QuotationRequestDetailAPIView.as_view(), name = 'QuotationRequest-get'),
    path('quotationrequest/<uuid:uuid>/export/',QuotationRequestExportPDFAPIView.as_view(), name = 'QuotationRequest-export'),



    

]
