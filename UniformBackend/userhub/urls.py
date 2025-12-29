from django.urls import path
from .views import *
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
    path('favourite/toggle/', ToggleFavouriteAPIView.as_view(), name='toggle-favourite'),


    # path("verify-email/<uid>/", VerifyEmailAPIView.as_view())
    # path("reset-password-page/", ResetPasswordPageView.as_view(), name="reset-password-page"),
    # path("simulations-history",name="simulations-history")
    # path("notifications/create/", NotificationCreateAPIView.as_view()),
    # path("notifications/", NotificationListAPIView.as_view()),
    # path("notifications/<int:pk>/", NotificationDetailAPIView.as_view()),
    # path("notifications/<int:pk>/update/", NotificationUpdateAPIView.as_view()),
    # path("notifications/<int:pk>/delete/", NotificationDeleteAPIView.as_view()),

    #  CART  
    path("cart/add/", AddToCartAPIView.as_view()),
    path("cart/list/", CartListAPIView.as_view()),
    path("cart/item/update/", UpdateCartItemAPIView.as_view()),
    path("cart/item/delete/", RemoveCartItemAPIView.as_view()),
    path("cart/item-summary/", ItemSummaryAPIView.as_view()),

    # order
    path("create/order/",CreateOrderAPIView.as_view()),
    path('order/summary/', OrderSummaryAPIView.as_view(), name='order-summary'),
    path("order/id/",OrderDetailAPIView.as_view()),
    path("order/list/",OrderListAPIView.as_view()),


    # payment 
    path("payments/create-intent/", CreatePaymentIntentAPIView.as_view()),
    path("payments/", UserPaymentListAPIView.as_view()),
    path("payments/detail/", UserPaymentDetailAPIView.as_view()),


    path("admin/payments/", AdminPaymentListAPIView.as_view()),
    path("admin/payments/detail/", AdminPaymentDetailAPIView.as_view()),

]
   
    


