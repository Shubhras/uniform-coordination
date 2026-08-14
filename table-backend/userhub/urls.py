from django.urls import path
from .views import *
from .threed import *
from .payment import *
from userhub import views
from .pdf import *

urlpatterns = [
    path('signup/', SignupAPIView.as_view(), name='user-signup'),
    path('login/', UserLoginAPIView.as_view(), name="user-login"),
    path("profile/", GetProfileAPIView.as_view(), name="get_profile"),
    path("profile/update/", userUpdateProfileAPIView.as_view(), name="update_profile"),
    path("profile/delete/", DeleteProfileAPIView.as_view(), name="delete_profile"),
    path("forgot-password/", ForgotPasswordAPIView.as_view(), name="forgot_password"),
    path("reset-password/", ResetPasswordAPIView.as_view(), name="reset_password"),
    path("update-password/", UpdatePasswordAPIView.as_view(), name="update-password"),
    path("verify-user/", VerifyUserAPIView.as_view(), name="verify-user"),
    path('favourite/toggle/', ToggleProductFavouriteAPIView.as_view(), name='toggle-product-favourite'),
    path('theme/favourite/toggle/', ToggleThemeFavouriteAPIView.as_view(), name='toggle-theme-favourite'),


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

    #<------------------------CustomUpdateTheme---------------------->
    path('customupdatethemes/create/', CustomUpdateThemesCreateAPIView.as_view(), name = 'custom-theme-create'),
    path('customupdatethemes/get-list/', CustomUpdateThemesListAPIView.as_view(), name = 'custom-theme-get-list'),
    path('customupdatethemes/<int:id>/get/', CustomUpdateThemesDetailAPIView.as_view(), name = 'custom-theme-get'),
    path('customupdatethemes/<int:id>/update/', CustomUpdateThemesUpdateAPIView.as_view(), name = 'custom-theme-update'),
    path('customupdatethemes/delete/', CustomUpdateThemesDeleteAPIView.as_view(), name = 'custom-theme-delete'),
    path('customupdatethemes/<int:customization_id>/export/', CustomUpdateThemeExportPDFAPIView.as_view(), name = 'custom-theme-export'),
    path('customupdatethemesuser/get-list/', CustomThemesUserAPIView.as_view(), name = 'get-theme-list'),

    #<-----------------------------QuotationRequest-------------------->
    path('quotationrequest/create/',QuotationRequestCreateAPIView.as_view(), name = 'QuotationRequest-create'),
    path('quotationrequest/<str:quotation_id>/get/',QuotationRequestDetailAPIView.as_view(), name = 'QuotationRequest-get'),
    path('quotationrequest/<str:quotation_id>/export/',QuotationRequestExportPDFAPIView.as_view(), name = 'QuotationRequest-export'),
    path('quotationrequest/get-list/',QuotationRequestsListAPIView.as_view(), name = 'get-list'),
    
    path('quotations/<int:pk>/', QuotationDetailView.as_view(), name='quotation-detail'),
    path('quotations/<int:pk>/pdf/', QuotationPDFView.as_view(), name='quotation-pdf'),
    #<-------------------Card API------------------------------->
    
    path("cart/add/",AddToCartAPIView.as_view()),
    path("cart/list/",CartListAPIView.as_view()),
    path("cart/item/<int:id>/update/",UpdateCartItemAPIView.as_view()),
    path("cart/item/<int:id>/delete/", RemoveCartItemAPIView.as_view()),#single item remove 
    path("cart/item-summary/",ItemSummaryAPIView.as_view()),
    path("cart/clear/", ClearCartAPIView.as_view()),# all items remove 

    #<-------------------ORDER API------------------------------->
    path("customer/details/", CustomerDetailsRetrieveAPIView.as_view()),
    path("create/order/",CreateOrderAPIView.as_view()),
    path('order/summary/',OrderSummaryAPIView.as_view(), name='order-summary'),  #show full checkout/order review
    path("order/<str:order_id>/get/",OrderDetailAPIView.as_view()),
    path("order/id/",OrderDetailAPIView.as_view()),
    path('user/order/list/', UserOrderListAPIView.as_view(), name='order-list'),  
    path('order/<str:order_id>/reorder/', ReorderOrderAPIView.as_view(), name='reorder_order'),
    path('order/reorder/', ReorderOrderAPIView.as_view(), name='reorder_order_post'),
    path('order/<str:order_id>/cancel/', UserCancelOrderAPIView.as_view(), name='user_cancel_order'),
    # Return an order (post-shipment)
    path('order/return/',ReturnOrderAPIView.as_view(), name='user_return_order'),
    
    path("admin/product/orders-rentallist/<int:product_id>/",ProductOrderListAPIView.as_view(),name="product-order-list"),


    #<-------------------Payment API------------------------------->
    path("payments/create-intent/",CreatePaymentAPIView.as_view()),
    path("payments/", UserPaymentListAPIView.as_view(), name="user-payment-list"),
    path("payments/detail/<str:payment_id>/", UserPaymentDetailAPIView.as_view(), name="user-payment-detail"),
    path('payment/<int:payment_id>/pdf/', PaymentPDFView.as_view(), name='payment-pdf'),
    path('stripe/webhook/', stripe_webhook, name='stripe-webhook'),
    
    path('paypay/webhook/', paypay_webhook, name='paypay-webhook'),
    path('np-kakebarai/webhook/', np_kakebarai_webhook, name='np-kakebarai-webhook'),

    path("admin/payments/", AdminPaymentListAPIView.as_view()),
    path("admin/payments/list/", AdminPaymentListAPIView.as_view()),
    path("admin/payments/detail/<str:payment_id>/", AdminPaymentDetailAPIView.as_view()),
    
    # path('user/refunds/', UserRefundRequestAPIView.as_view(), name='user-refund-list'),
    
    path("quotationstatus/user/",UserQuotationStatusUpdateAPIView.as_view(), name = "QuotationStatus-post"),
    
    #<-------------OrderHistory---------------------->
    path("orderhistory/get-list/",OrderHistoryAPIView.as_view(),name='get-list'),
    path('docusign/webhook/', DocuSignWebhookAPIView.as_view(), name='docusign-webhook'),
    #<-------------Notifications---------------------->
    path("notifications/list/", UserNotificationListAPIView.as_view(), name='user-notifications-list'),
    path("notifications/mark-read/", UserNotificationMarkReadAPIView.as_view(), name='user-notifications-mark-read'),
    path("notifications/mark-read/<int:pk>/", UserNotificationMarkReadAPIView.as_view(), name='user-notification-mark-read-single'),
    path("notifications/delete/<int:pk>/", UserNotificationDeleteAPIView.as_view(), name='user-notification-delete'),
]
   
    


