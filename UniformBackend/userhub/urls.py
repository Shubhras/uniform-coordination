from django.urls import path
from .views import *
from .threed import *
from .payment import *
from userhub import views


urlpatterns = [
    path('signup/', SignupAPIView.as_view(), name='user-signup'),
    path('login/', UserLoginAPIView.as_view(), name="user-login"),
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
    path('customupdateuser/get-list/', CustomModelsUserAPIView.as_view(), name = 'get-list'),
    #<-----------------------------QuotationRequest-------------------->
    path('quotationrequest/create/',QuotationRequestCreateAPIView.as_view(), name = 'QuotationRequest-create'),
    path('quotationrequest/<str:quotation_id>/get/',QuotationRequestDetailAPIView.as_view(), name = 'QuotationRequest-get'),
    path('quotationrequest/<str:quotation_id>/export/',QuotationRequestExportPDFAPIView.as_view(), name = 'QuotationRequest-export'),
    path('quotationrequest/get-list/',QuotationRequestsListAPIView.as_view(), name = 'get-list'),
    #<-------------------Card API------------------------------->
    path("cart/add/",AddToCartAPIView.as_view()),
    path("cart/list/",CartListAPIView.as_view()),
    path("cart/item/update/",UpdateCartItemAPIView.as_view()),
    path("cart/item/delete/",RemoveCartItemAPIView.as_view()),
    path("cart/item-summary/",ItemSummaryAPIView.as_view()),
    path("cart/clear/", ClearCartAPIView.as_view()),

    #<-------------------ORDER API------------------------------->
    path("create/order/",CreateOrderAPIView.as_view()),
    path('order/summary/<str:order_id>/',OrderSummaryAPIView.as_view(), name='order-summary'),  #show full checkout/order review
    path("order/<str:order_id>/",OrderDetailAPIView.as_view()),
    path('user/order/list/', UserOrderListAPIView.as_view(), name='order-list'),     
    path('user/order/cancel/<str:order_id>/',UserCancelOrderAPIView.as_view(), name='user-order-cancel'),

    path('rental/orders/create/', CreateRentalOrderAPIView.as_view(), name='create_rental_order'),
    path('orders/<str:order_id>/return/', UserReturnOrderAPIView.as_view(), name='return_order'),
    path("rental/list/",RentalListAPIView.as_view(),name ="rental-list"),

    #<-------------------Payment API------------------------------->
    path("payments/create-intent/",CreatePaymentAPIView.as_view()),
    path("payments/", UserPaymentListAPIView.as_view()),
    path("payments/detail/", UserPaymentDetailAPIView.as_view()), 
    path('payment/<int:payment_id>/pdf/', PaymentPDFView.as_view(), name='payment-pdf'),

    path("admin/payments/",AdminPaymentListAPIView.as_view()),
    path("admin/payments/detail/",AdminPaymentDetailAPIView.as_view()),
    # path('user/refunds/', UserRefundRequestAPIView.as_view(), name='user-refund-list'),
    
    path("quotationstatus/user/",UserQuotationStatusUpdateAPIView.as_view(), name = "QuotationStatus-post"),
    
    #<-------------OrderHistory---------------------->
    path("orderhistory/get-list/",OrderHistoryAPIView.as_view(),name='get-list'),
    path('docusign/webhook/', DocuSignWebhookAPIView.as_view(), name='docusign-webhook'),
   

]
   
    


