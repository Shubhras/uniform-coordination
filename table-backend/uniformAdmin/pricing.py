from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from .fabric import IsAdministrator, CustomPagination
from django.db.models import Q
from .models import PricingPackage, PricingRule ,RentalPolicySettings
from .serializers import PricingPackageSerializer, PricingRuleSerializer ,RentalPolicySettingsSerializer
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAdminUser  # or your admin-only permission




class PricingPackageListCreateAPIView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            packages = PricingPackage.objects.all().order_by('-id')
            paginator = CustomPagination()
            paginated_packages = paginator.paginate_queryset(packages, request)
            serializer = PricingPackageSerializer(paginated_packages, many=True)
            
            response = {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Pricing Packages fetched successfully.",
                "data": serializer.data,
                "pagination": {
                    "page": paginator.page.number,
                    "page_size": paginator.get_page_size(request),
                    "total_pages": paginator.page.paginator.num_pages,
                    "total_items": paginator.page.paginator.count
                }
            }
            return Response(response, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"status": False, "statusCode": 500, "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        serializer = PricingPackageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": True, "statusCode": 201, "message": "Pricing Package created.", "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response({"status": False, "statusCode": 400, "message": "Validation failed.", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class PricingPackageDetailAPIView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def get_object(self, pk):
        try:
            return PricingPackage.objects.get(pk=pk)
        except PricingPackage.DoesNotExist:
            return None

    def get(self, request, pk):
        package = self.get_object(pk)
        if not package:
            return Response({"status": False, "statusCode": 404, "message": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = PricingPackageSerializer(package)
        return Response({"status": True, "statusCode": 200, "message": "Fetched successfully.", "data": serializer.data}, status=status.HTTP_200_OK)

    def put(self, request, pk):
        package = self.get_object(pk)
        if not package:
            return Response({"status": False, "statusCode": 404, "message": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = PricingPackageSerializer(package, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": True, "statusCode": 200, "message": "Updated successfully.", "data": serializer.data}, status=status.HTTP_200_OK)
        return Response({"status": False, "statusCode": 400, "message": "Validation failed.", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        package = self.get_object(pk)
        if not package:
            return Response({"status": False, "statusCode": 404, "message": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        package.delete()
        return Response({"status": True, "statusCode": 200, "message": "Deleted successfully."}, status=status.HTTP_200_OK)

class PricingRuleListCreateAPIView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            rules = PricingRule.objects.all().order_by('-id')
            paginator = CustomPagination()
            paginated_rules = paginator.paginate_queryset(rules, request)
            serializer = PricingRuleSerializer(paginated_rules, many=True)
            
            response = {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Pricing Rules fetched successfully.",
                "data": serializer.data,
                "pagination": {
                    "page": paginator.page.number,
                    "page_size": paginator.get_page_size(request),
                    "total_pages": paginator.page.paginator.num_pages,
                    "total_items": paginator.page.paginator.count
                }
            }
            return Response(response, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"status": False, "statusCode": 500, "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        serializer = PricingRuleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": True, "statusCode": 201, "message": "Pricing Rule created.", "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response({"status": False, "statusCode": 400, "message": "Validation failed.", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class PricingRuleDetailAPIView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def get_object(self, pk):
        try:
            return PricingRule.objects.get(pk=pk)
        except PricingRule.DoesNotExist:
            return None

    def get(self, request, pk):
        rule = self.get_object(pk)
        if not rule:
            return Response({"status": False, "statusCode": 404, "message": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = PricingRuleSerializer(rule)
        return Response({"status": True, "statusCode": 200, "message": "Fetched successfully.", "data": serializer.data}, status=status.HTTP_200_OK)

    def put(self, request, pk):
        rule = self.get_object(pk)
        if not rule:
            return Response({"status": False, "statusCode": 404, "message": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = PricingRuleSerializer(rule, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": True, "statusCode": 200, "message": "Updated successfully.", "data": serializer.data}, status=status.HTTP_200_OK)
        return Response({"status": False, "statusCode": 400, "message": "Validation failed.", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        rule = self.get_object(pk)
        if not rule:
            return Response({"status": False, "statusCode": 404, "message": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        rule.delete()
        return Response({"status": True, "statusCode": 200, "message": "Deleted successfully."}, status=status.HTTP_200_OK)




class RentalPolicySettingsRetrieveView(APIView):
    """
    GET /api/v1/settings/rental-policy/
    Returns the current global rental policy settings (drives left summary panel).
    """
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        settings_obj = RentalPolicySettings.load()
        data = RentalPolicySettingsSerializer(settings_obj).data
        return Response(
            {
                "success": True,
                "status_code": 200,
                "message": "Fetched successfully",
                "data": data,
            },
            status=200,
        )


class RentalPolicySettingsUpdateView(APIView):
    """
    PUT /api/v1/settings/rental-policy/update/
    Saves edits to the global rental policy settings (Save Rules button).
    """
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def put(self, request):
        settings_obj = RentalPolicySettings.load()
        serializer = RentalPolicySettingsSerializer(
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
                "message": "Pricing rules updated successfully",
                "data": serializer.data,
            },
            status=200,
        )