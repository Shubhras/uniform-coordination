from .models import *
from uniformAdmin.serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated ,BasePermission,AllowAny
from rest_framework import status
from uniformAdmin.fabric import CustomPagination,IsAdministrator
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.authentication import JWTAuthentication


#----------------Catalog Image -----------------

class CatalogImageCreateAPIView(APIView):
    
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication] 

    def post(self, request):
        try:
            serializer = CatalogImageSerializer(data=request.data, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Catalog Image created successfully.",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)


            first_error = next(iter(serializer.errors.values()))[0]
            return Response({
                "status": False,
                "statusCode": 200,
                "message": f"Validation failed;{first_error}"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 200,
                "message": "Server error",
                "error": str(e)
            }, status=status.HTTP_200_OK)


class CatalogImageListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            name = request.query_params.get("name", "").strip()

            queryset = CatalogImage.objects.filter(isDeleted=False)

            # Search ONLY by name
            if name:
                queryset = queryset.filter(name__icontains=name)

            queryset = queryset.order_by("-id")

            # Pagination (EXACTLY like reference API)
            paginator = CustomPagination()
            page = paginator.paginate_queryset(queryset, request)

            serializer = CatalogImageSerializer(
                page, many=True, context={"request": request}
            )

            response = {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Catalog Image list fetched successfully.",
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
                "statusCode": 200,
                "message": "Server error",
                "error": str(e)
            }, status=status.HTTP_200_OK)


class CatalogImageDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            catalog_image = get_object_or_404(CatalogImage, pk=pk, isDeleted=False)
            serializer = CatalogImageSerializer(catalog_image, context={"request": request})

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Catalog Image details fetched successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 200,
                "message": "Server error",
                "error": str(e)
            }, status=status.HTTP_200_OK)


class CatalogImageUpdateAPIView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication] 

    def put(self, request, pk):
        try:
            catalog_image = get_object_or_404(CatalogImage, pk=pk, isDeleted=False)

            serializer = CatalogImageSerializer(
                catalog_image,
                data=request.data,
                partial=True,
                context={"request": request}
            )

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Catalog Image updated successfully.",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)


            if "name" in serializer.errors:
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Validation failed;Catalog Image with this Name already exists"
                }, status=status.HTTP_200_OK)

            return Response({
                "status": False,
                "statusCode": 200,
                "message": "Validation failed.",
                "error": serializer.errors
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 200,
                "message": "Server error",
                "error": str(e)
            }, status=status.HTTP_200_OK)


class CatalogImageDeleteAPIView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication] 

    def delete(self, request, pk):
        try:
            catalog_image = get_object_or_404(CatalogImage, pk=pk, isDeleted=False)
            catalog_image.isDeleted = True
            catalog_image.save()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Catalog Image deleted successfully."
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 200,
                "message": "Server error",
                "error": str(e)
            }, status=status.HTTP_200_OK)

