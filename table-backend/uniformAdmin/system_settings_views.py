from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from .fabric import IsAdministrator
from .models import SystemSettings
from .serializers import SystemSettingsSerializer

class SystemSettingsRetrieveView(APIView):
    """
    GET /api/v1/settings/system/
    Returns the current global system settings.
    """
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        settings_obj = SystemSettings.load()
        data = SystemSettingsSerializer(settings_obj).data
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
            settings_obj, data=request.data, partial=True
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

