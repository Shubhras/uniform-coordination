from django.urls import path
from .views import *
from .threed import *
from .payment import *


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
    # path('favourite/toggle/', ToggleFavouriteAPIView.as_view(), name='toggle-favourite'),


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
    path('customupdatemodels/create/',CustomUpdateModelsCreateAPIView.as_view(), name = 'custom-create'),
    path('customupdatemodels/get-list/',CustomUpdateModelsListAPIView.as_view(), name = 'custom-get-list'),
    path('customupdatemodels/<int:id>/get/',CustomUpdateModelsDetailAPIView.as_view(), name = 'custom-get'),
    path('customupdatemodels/<int:id>/update/',CustomUpdateModelsUpdateAPIView.as_view(), name = 'custom-update'),
    path('customupdatemodels/delete/',CustomUpdateModelsDeleteAPIView.as_view(), name = 'custom-delete'),
    path('customupdatemodels/<int:customization_id>/export/',CustomUpdateModelExportPDFAPIView.as_view(), name = 'custom-get'),
    
    #<-----------------------------QuotationRequest-------------------->
    path('quotation-request/create/',QuotationRequestCreateAPIView.as_view(), name = 'QuotationRequest-create'),
    path('quotationrequest/<uuid:uuid>/get/',QuotationRequestDetailAPIView.as_view(), name = 'QuotationRequest-get'),
    path('quotationrequest/<uuid:uuid>/export/',QuotationRequestExportPDFAPIView.as_view(), name = 'QuotationRequest-export'),
    # path("quotation/<str:quotation_id>/agree/",QuotationAgreeAPIView.as_view(),name="quotation-agree"),
    # path("quotation/terms/<str:quotation_id>/", QuotationTermsAPIView.as_view(), name="Terms&Conditions"),
    #<-------------------Card API------------------------------->
    path("cart/add/", AddToCartAPIView.as_view()),
    path("cart/list/", CartListAPIView.as_view()),
    path("cart/item/update/", UpdateCartItemAPIView.as_view()),
    path("cart/item/delete/", RemoveCartItemAPIView.as_view()),
    path("cart/item-summary/", ItemSummaryAPIView.as_view()),

    #<-------------------ORDER API------------------------------->
    path("create/order/",CreateOrderAPIView.as_view()),
    path('order/summary/', OrderSummaryAPIView.as_view(), name='order-summary'),
    path("order/id/",OrderDetailAPIView.as_view()),
    path("order/list/",OrderListAPIView.as_view()),


    #<-------------------Payment API------------------------------->
    path("payments/create-intent/", CreatePaymentIntentAPIView.as_view()),
    path("payments/", UserPaymentListAPIView.as_view()),
    path("payments/detail/", UserPaymentDetailAPIView.as_view()),
    path("stripe/webhook",StripeWebhookAPIView.as_view()),
     
    path("admin/payments/", AdminPaymentListAPIView.as_view()),
    path("admin/payments/detail/", AdminPaymentDetailAPIView.as_view()),
    
    path("quotationstatus/user/",UserQuotationStatusUpdateAPIView.as_view(), name = "QuotationStatus-post"),
   
   
]
   
    


