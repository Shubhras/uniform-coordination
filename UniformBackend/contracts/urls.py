from django.urls import path
from .views import *


urlpatterns = [
    path('send-quotation/', QuotationSendAPIView.as_view(), name='send-quotation'),

]
