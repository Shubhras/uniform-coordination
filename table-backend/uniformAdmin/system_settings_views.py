from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from .models import SystemSettings
from .serializers import SystemSettingsSerializer
from .fabric import IsAdministrator

class SystemSettingsRetrieveView(APIView):
    """
    GET /api/v1/settings/system/
    Returns the current global system settings.
    """
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        settings_obj = SystemSettings.load()
        data = SystemSettingsSerializer(
            settings_obj,
            context={"request": request}
        ).data

        # Check if the requesting user is an administrator
        is_admin = False
        try:
            is_admin = (
                request.user and
                request.user.is_authenticated and
                hasattr(request.user, "role") and
                request.user.role and
                request.user.role.role_name.lower() == "admin"
            )
        except AttributeError:
            pass

        if not is_admin:
            sensitive_fields = [
                "email_password",
                "stripe_secret_key",
                "stripe_webhook_secret",
                "email_host",
                "email_port",
                "email_username"
            ]
            for field in sensitive_fields:
                if field in data:
                    data[field] = ""

        return Response(
            {
                "success": True,
                "status_code": 200,
                "message": "Fetched successfully",
                "data": data,
            },
            status=200,
        )

class SystemSettingsUpdateView(APIView):
    """
    PUT /api/v1/settings/system/update/
    Saves edits to the global system settings.
    """
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def put(self, request):
        settings_obj = SystemSettings.load()
        serializer = SystemSettingsSerializer(
            settings_obj,
            data=request.data,
            partial=True,
            context={"request": request}   # <-- add this
        )
        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "status_code": 400,
                    "message": "Validation failed",
                    "errors": serializer.errors,
                },
                status=400,
            )
        serializer.save()
        return Response(
            {
                "success": True,
                "status_code": 200,
                "message": "System settings updated successfully",
                "data": serializer.data,
            },
            status=200,
        )
