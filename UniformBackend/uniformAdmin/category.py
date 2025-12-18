from .models import *
from uniformAdmin.serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated ,BasePermission,AllowAny
from rest_framework import status
from uniformAdmin.fabric import CustomPagination,IsAdministrator
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.authentication import JWTAuthentication





#---------------------------Categories--------------------------

class CategoryCreateAPIView(APIView):
   
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication] 

    def post(self, request):
        try:
            serializer = CategorySerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Category created successfully.",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)

            if "categoryName" in serializer.errors:
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Validation failed; Category with this categoryName already exists."
                }, status=status.HTTP_200_OK)

            return Response({
                "status": False,
                "statusCode": 200,
                "message": "Validation failed.",
                "error": serializer.errors
            }, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while creating category.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CategoryListAPIView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            search = request.query_params.get("search", "").strip()

            categories = Category.objects.filter(isDeleted=False)

            # Search only on categoryName (as per requirement)
            if search:
                categories = categories.filter(categoryName__icontains=search)

            categories = categories.order_by("-created_at")

            # Apply pagination (same as reference API)
            paginator = CustomPagination()
            page = paginator.paginate_queryset(categories, request)
            serializer = CategorySerializer(page, many=True)

            response = {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Category list fetched successfully.",
                "data": serializer.data,
                "pagination": {
                    "page": paginator.page.number,
                    "page_size": paginator.get_page_size(request),
                    "total_pages": paginator.page.paginator.num_pages,
                    "total_items": paginator.page.paginator.count
                }
            }

            return Response(response, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while fetching categories.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CategoryDetailAPIView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, category_id):
        try:
            category = Category.objects.filter(
                id=category_id,
                isDeleted=False
            ).first()

            if not category:
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Category not found."
                }, status=status.HTTP_200_OK)

            serializer = CategorySerializer(category)

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Category details fetched successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while fetching category.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CategoryUpdateAPIView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication] 

    def put(self, request, category_id):
        try:
            try:
                category = Category.objects.get(
                    id=category_id,
                    isDeleted=False
                )
            except Category.DoesNotExist:
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Category not found."
                }, status=status.HTTP_200_OK)

            serializer = CategorySerializer(
                category,
                data=request.data,
                partial=True
            )

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Category updated successfully.",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)

            if "categoryName" in serializer.errors:
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Validation failed; Category with this categoryName already exists."
                }, status=status.HTTP_200_OK)

            return Response({
                "status": False,
                "statusCode": 200,
                "message": "Validation failed.",
                "error": serializer.errors
            }, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while updating category.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CategoryDeleteAPIView(APIView):
    
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication] 

    def delete(self, request, category_id):
        try:
            try:
                category = Category.objects.get(
                    id=category_id,
                    isDeleted=False
                )
            except Category.DoesNotExist:
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Category not found."
                }, status=status.HTTP_200_OK)

            category.isDeleted = True
            category.save()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Category deleted successfully."
            }, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while deleting category.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
