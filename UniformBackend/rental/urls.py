# rental/urls.py
from django.urls import path
from .views import *

urlpatterns = [
    # path("check-availability/", CheckRentalAvailabilityAPIView.as_view()),
    # path("create-reservation/", CreateRentalReservationAPIView.as_view()),
    # path("create-units/", AdminCreateRentalUnitsAPIView.as_view()),
    # path("generate-contract/",GenerateRentalContractAPIView.as_view()),
    path("mark-return/", MarkOrderItemReturnAPIView.as_view()),
]
