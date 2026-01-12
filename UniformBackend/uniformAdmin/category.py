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





#---------------------------Categories--------------------------

# class CategoryCreateAPIView(APIView):
   
#     permission_classes = [IsAdministrator]
#     authentication_classes = [JWTAuthentication] 

#     def post(self, request):
#         try:
#             serializer = CategorySerializer(data=request.data)
#             if serializer.is_valid():
#                 serializer.save()
#                 return Response({
#                     "status": True,
#                     "statusCode": 200,
#                     "message": "Category created successfully.",
#                     "data": serializer.data
#                 }, status=status.HTTP_200_OK)

#             if "categoryName" in serializer.errors:
#                 return Response({
#                     "status": False,
#                     "statusCode": 200,
#                     "message": "Validation failed; Category with this categoryName already exists."
#                 }, status=status.HTTP_200_OK)

#             return Response({
#                 "status": False,
#                 "statusCode": 200,
#                 "message": "Validation failed.",
#                 "error": serializer.errors
#             }, status=status.HTTP_200_OK)

#         except Exception as exc:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": "Server error while creating category.",
#                 "error": str(exc)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class CategoryCreateAPIView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication] 

    def post(self, request):
        try:
            serializer = CategorySerializer(data=request.data)
            if serializer.is_valid():

                #  FIX: set next order
                last_order = Category.objects.filter(isDeleted=False).aggregate(
                    max_order=Max("order")
                )["max_order"] or 0

                serializer.save(order=last_order + 1)

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
    #permission_classes = [AllowAny]
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication] 

    def get(self, request):
        try:
            search = request.query_params.get("search", "").strip()

            # categories = Category.objects.filter(isDeleted=False)
            categories = Category.objects.filter(isDeleted=False).order_by("order")


            # Search only on categoryName (as per requirement)
            if search:
                categories = categories.filter(categoryName__icontains=search)

            # categories = categories.order_by("-created_at")
            categories = categories.order_by("order", "created_at")


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


# class CategoryReorderAPIView(APIView):
#     permission_classes = [IsAdministrator]
#     authentication_classes = [JWTAuthentication]

#     def post(self, request):
#         try:
#             ordered_ids = request.data.get("ordered_category_ids")

#             if not ordered_ids or not isinstance(ordered_ids, list):
#                 return Response({
#                     "status": False,
#                     "statusCode": 400,
#                     "message": "ordered_category_ids must be a list."
#                 }, status=400)

#             for index, category_id in enumerate(ordered_ids):
#                 Category.objects.filter(
#                     id=category_id,
#                     isDeleted=False
#                 ).update(order=index)

#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Category order updated successfully."
#             }, status=200)

#         except Exception as exc:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": "Unable to reorder categories.",
#                 "error": str(exc)
#             }, status=500)



class CategoryReorderAPIView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def put(self, request):
        category_id = request.data.get("category_id")
        new_position = request.data.get("new_position")

        if category_id is None or new_position is None:
            return Response({
                "status": False,
                "statusCode": 200,
                "message": "category_id and new_position are required."
            }, status=200)

        try:
            category = Category.objects.get(id=category_id, isDeleted=False)
        except Category.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "Category not found."
            }, status=404)

        old_position = category.order

        if old_position == new_position:
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Category already at this position."
            }, status=200)

        # Shift other categories
        if new_position < old_position:
            Category.objects.filter(
                order__gte=new_position,
                order__lt=old_position,
                isDeleted=False
            ).update(order=models.F("order") + 1)
        else:
            Category.objects.filter(
                order__gt=old_position,
                order__lte=new_position,
                isDeleted=False
            ).update(order=models.F("order") - 1)

        category.order = new_position
        category.save(update_fields=["order"])

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Category reordered successfully."
        }, status=200)
