from .models import *
from uniformAdmin.serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated ,BasePermission,AllowAny
from rest_framework import status
from uniformAdmin.fabric import CustomPagination,IsAdministrator
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Max


#---------------- Sub Catgory -----------------


class SubCategoryCreateAPIView(APIView):

    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication] 

    def post(self, request):
        try:
            serializer = SubCategorySerializer(data=request.data)
            if serializer.is_valid():
                
                category = serializer.validated_data.get("category")

                #FIX: Auto-assign order per category
                max_order = SubCategory.objects.filter(
                    category=category,
                    isDeleted=False
                ).aggregate(max_order=Max("order"))["max_order"] or 0

                serializer.save(order=max_order + 1)
                                    
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "SubCategory created successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)

            # REQUIRED FIELD ERROR
            if "name" in serializer.errors and "required" in str(serializer.errors["name"]).lower():
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Validation Failed;subcategory name is required.",
                    "data": None
                }, status=status.HTTP_200_OK)

            # DUPLICATE (subcategory + category) ERROR
            if "name" in serializer.errors and "already exists" in str(serializer.errors["name"]).lower():
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Validation Failed;subcategory with this name is already exits.",
                    "data": None
                }, status=status.HTTP_200_OK)

            return Response({
                "status": False,
                "statusCode": 400,
                "message": serializer.errors,
                "data": None
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": str(e),
                "data": None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubCategoryListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            search_query = request.query_params.get("search", "").strip()

            subcategories = SubCategory.objects.filter(isDeleted=False)

            if search_query:
                subcategories = subcategories.filter(
                    name__icontains=search_query
                )

            # subcategories = subcategories.order_by("-id")
            subcategories = subcategories.order_by("order", "created_at")


            paginator = CustomPagination()
            page = paginator.paginate_queryset(subcategories, request)
            serializer = SubCategorySerializer(page, many=True)

            response = {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "SubCategory list fetched successfully",
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
            return Response({
                "status": False,
                "statusCode": 500,
                "message": f"Internal server error: {str(e)}",
                "data": None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubCategoryDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            subcategory = get_object_or_404(
                SubCategory,
                pk=pk,
                isDeleted=False
            )

            serializer = SubCategorySerializer(subcategory)

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "SubCategory details fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": str(e),
                "data": None
            }, status=status.HTTP_404_NOT_FOUND)


class SubCategoryUpdateAPIView(APIView):

    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication] 


    def put(self, request, pk):
        try:
            subcategory = get_object_or_404(
                SubCategory,
                pk=pk,
                isDeleted=False
            )

            serializer = SubCategorySerializer(
                subcategory,
                data=request.data,
                partial=True
            )

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "SubCategory updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)

            # REQUIRED FIELD ERROR
            if "name" in serializer.errors and "required" in str(serializer.errors["name"]).lower():
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Validation Failed;subcategory name is required.",
                    "data": None
                }, status=status.HTTP_200_OK)

            # DUPLICATE (subcategory + category) ERROR
            if "name" in serializer.errors and "already exists" in str(serializer.errors["name"]).lower():
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Validation Failed;subcategory with this name is already exits.",
                    "data": None
                }, status=status.HTTP_200_OK)

            return Response({
                "status": False,
                "statusCode": 400,
                "message": serializer.errors,
                "data": None
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": str(e),
                "data": None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubCategoryDeleteAPIView(APIView):

    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication] 

    def delete(self, request, pk):
        try:
            subcategory = get_object_or_404(
                SubCategory,
                pk=pk,
                isDeleted=False
            )

            subcategory.isDeleted = True
            subcategory.isActive = False
            subcategory.save()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "SubCategory deleted successfully",
                "data": None
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": str(e),
                "data": None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


