import jwt
from django.conf import settings
from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from openpyxl import Workbook
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from uniformAdmin.models import*
import io 
import csv
from django.http import HttpResponse


def generate_custom_tokens(user):
    """Generate custom access & refresh tokens for normal Users."""

    access_payload = {
        "user_id": user.id,
        "email": user.email,
        "type": "access",
        "exp": datetime.utcnow() + timedelta(minutes=60),
        "iat": datetime.utcnow(),
    }

    refresh_payload = {
        "user_id": user.id,
        "email": user.email,
        "type": "refresh",
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow(),
    }

    access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm="HS256")
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm="HS256")

    return {
        "access": access_token,
        "refresh": refresh_token,
    }



#======================================================================



class BaseAPIView(APIView):
    """
    Common response handler for all APIs
    """

    def success_response(self, message, data=None):
        return Response(
            {
                "status": True,
                "statusCode": 200,
                "message": message,
                "data": data,
            },
            status=status.HTTP_200_OK,
        )


    def error_response(self, message):
        # Handle serializer validation errors
        if isinstance(message, dict):
            first_error = next(iter(message.values()))
            if isinstance(first_error, list):
                message = f"Validation Failed; {first_error[0]}"

            else:
                message = f"Validation Failed; {first_error}"

        return Response(
            {
                "status": False,
                "statusCode": 200,
                "message": message,
            },
            status=status.HTTP_200_OK,
        )


#=============================================================================

