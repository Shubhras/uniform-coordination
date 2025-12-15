from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated ,BasePermission,AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .serializers import FabricSerializer
from .models import Fabric

import logging  
logger = logging.getLogger(__name__)

class IsAdministrator(BasePermission):
    """
    Only allow AdminUser with role 'admin'.
    """
    def has_permission(self, request, view):
        try:
            user = request.user
            return (
                user and 
                user.is_authenticated and 
                hasattr(user, "role") and 
                user.role and 
                user.role.role_name.lower() == "admin"
            )
        except AttributeError:
            return False
        
class CustomPagination(PageNumberPagination):
    """Custom Pagination for Professional Users"""
    page_size = 10  # Number of results per page
    page_size_query_param = "page_size"
    max_page_size = 100  # Set a reasonable limit

    
    
#permission_classes = [IsAuthenticated, IsAdministrator]
class FabricCreateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]  # <-- ensures request.user is AdminUser

    def post(self, request):
        try:
            serializer = FabricSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save()
                response = {
                    "statusCode": 200,
                    "status": True,
                    "message": "Fabric created successfully",
                    "data": serializer.data
                }
                logger.info(f"FabricCreateView POST - 200 - {response}")
                return Response(response)

            response = {
                "statusCode": 400,
                "status": False,
                "message": serializer.errors
            }
            logger.warning(f"FabricCreateView POST - 400 - {response}")
            return Response(response)

        except Exception as e:
            response = {
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }
            logger.error(f"FabricCreateView POST - 500 - {response}")
            return Response(response)


class FabricListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            search_query = request.query_params.get("search", "").strip()

            fabrics = Fabric.objects.filter(isDeleted=False)

            if search_query:
                fabrics = fabrics.filter(
                    Q(fabricName__icontains=search_query) |
                    Q(color__icontains=search_query) |
                    Q(materialType__icontains=search_query)
                )

            fabrics = fabrics.order_by("-id")

            paginator = CustomPagination()
            page = paginator.paginate_queryset(fabrics, request)
            serializer = FabricSerializer(page, many=True)

            # Build your required response manually
            response = {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Fabric list fetched successfully",
                "data": serializer.data,
                "pagination": {
                    "page": paginator.page.number,
                    "page_size": paginator.get_page_size(request),
                    "total_pages": paginator.page.paginator.num_pages,
                    "total_items": paginator.page.paginator.count
                }
            }

            return Response(response)

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }, status=500)

        
class FabricDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            try:
                fabric = Fabric.objects.get(id=pk, isDeleted=False)
            except Fabric.DoesNotExist:
                response = {
                    "statusCode": 404,
                    "status": False,
                    "message": "Fabric not found"
                }
                logger.warning(f"FabricDetailView GET - {response}")
                return Response(response)

            serializer = FabricSerializer(fabric)
            response = {
                "statusCode": 200,
                "status": True,
                "message": "Fabric fetched successfully",
                "data": serializer.data
            }
            logger.info(f"FabricDetailView GET - {response}")
            return Response(response)

        except Exception as e:
            response = {
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }
            logger.error(f"FabricDetailView GET - {response}")
            return Response(response)
    
class FabricUpdateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]


    def put(self, request, pk):
        try:
            try:
                fabric = Fabric.objects.get(id=pk, isDeleted=False)
            except Fabric.DoesNotExist:
                response = {
                    "statusCode": 404,
                    "status": False,
                    "message": "Fabric not found"
                }
                logger.warning(f"FabricUpdateView PUT - {response}")
                return Response(response)

            serializer = FabricSerializer(fabric, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()

                response = {
                    "statusCode": 200,
                    "status": True,
                    "message": "Fabric updated successfully",
                    "data": serializer.data
                }
                logger.info(f"FabricUpdateView PUT - {response}")
                return Response(response)

            response = {
                "statusCode": 400,
                "status": False,
                "message": serializer.errors
            }
            logger.warning(f"FabricUpdateView PUT - {response}")
            return Response(response)

        except Exception as e:
            response = {
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }
            logger.error(f"FabricUpdateView PUT - {response}")
            return Response(response)


class FabricDeleteView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def delete(self, request, pk):
        try:
            try:
                fabric = Fabric.objects.get(id=pk, isDeleted=False)
            except Fabric.DoesNotExist:
                response = {
                    "statusCode": 404,
                    "status": False,
                    "message": "Fabric not found"
                }
                logger.warning(f"FabricDeleteView DELETE - {response}")
                return Response(response)

            fabric.isDeleted = True
            fabric.isActive = False
            fabric.save()

            response = {
                "statusCode": 200,
                "status": True,
                "message": "Fabric soft-deleted successfully"
            }
            logger.info(f"FabricDeleteView DELETE - {response}")
            return Response(response)

        except Exception as e:
            response = {
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }
            logger.error(f"FabricDeleteView DELETE - {response}")
            return Response(response)



