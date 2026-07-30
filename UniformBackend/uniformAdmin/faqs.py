
from rest_framework.views import APIView
from .models import *
from uniformAdmin.serializers import *
from django.core.paginator import Paginator
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from uniformAdmin.fabric import CustomPagination,IsAdministrator
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated ,BasePermission,AllowAny
from drf_spectacular.utils import extend_schema,OpenApiExample,OpenApiResponse,OpenApiParameter,OpenApiTypes


#-----------------------FAQs----------------------------------


@extend_schema(
    tags=["FAQ'S (Admin)"],
    summary="Create FAQ API",
    request=FAQSerializer,
    responses={
        201: OpenApiResponse(description="FAQ created successfully"),
        400: OpenApiResponse(description="Validation failed"),
        500: OpenApiResponse(description="Server error"),
    },
)
class FAQCreateAPIView(APIView):    
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication] 

    def post(self, request):
        try:
            serializer = FAQSerializer(data=request.data, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "FAQ created successfully.",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)

            error_message = ""
            if serializer.errors:
                first_key = next(iter(serializer.errors))
                error_message = serializer.errors[first_key][0]

            return Response({
                "status": False,
                "statusCode": 400,
                "message": f"Validation failed; {error_message}"
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while creating FAQ.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# class FAQListAPIView(APIView):
#     permission_classes = [AllowAny]
    
#     def get(self, request):
#         try:
#             search = request.query_params.get("search", "").strip()

#             faqs = FAQ.objects.filter(isDeleted=False, isActive=True)

#             if search:
#                 faqs = faqs.filter(title__icontains=search)

#             faqs = faqs.order_by("-created_at")

#             paginator = CustomPagination()
#             page = paginator.paginate_queryset(faqs, request)
#             serializer = FAQSerializer(page, many=True, context={"request": request})

#             response = {
#                 "count": paginator.page.paginator.count,
#                 "next": paginator.get_next_link(),
#                 "previous": paginator.get_previous_link(),
#                 "statusCode": 200,
#                 "status": True,
#                 "message": "FAQ list fetched successfully.",
#                 "data": serializer.data,
#                 "pagination": {
#                     "page": paginator.page.number,
#                     "page_size": paginator.get_page_size(request),
#                     "total_pages": paginator.page.paginator.num_pages,
#                     "total_items": paginator.page.paginator.count
#                 }
#             }
#             return Response(response, status=status.HTTP_200_OK)

#         except Exception as exc:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": "Server error while fetching FAQ list.",
#                 "error": str(exc)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




@extend_schema(
    tags=["FAQ'S (Admin)"],
    summary="FAQ List API",
    parameters=[
        OpenApiParameter(
            name="search",
            description="Search FAQs by title or special keywords (uniform, table)",
            required=False,
            type=str,
        ),
        OpenApiParameter(
            name="category",
            description="Filter FAQs by category ID",
            required=False,
            type=int,
        ),
        OpenApiParameter(
            name="type",
            description="Filter FAQs by type",
            required=False,
            type=str,
        ),
    ],
    responses={
        200: OpenApiResponse(description="FAQ list fetched successfully"),
        500: OpenApiResponse(description="Server error"),
    },
)
class FAQListAPIView(APIView):
    # permission_classes = [AllowAny]
    authentication_classes = []
    permission_classes = []

    
    def get(self, request):
        try:
            search = request.query_params.get("search", "").strip()

            faqs = FAQ.objects.filter(isDeleted=False, isActive=True)

            #  TYPE-BASED SEARCH (ONLY ADDITION)
            if search.lower() in ["uniform", "table"]:
                faqs = faqs.filter(type=search.lower())
            elif search:
                faqs = faqs.filter(title__icontains=search)

            faqs = faqs.order_by("-created_at")

            paginator = CustomPagination()
            page = paginator.paginate_queryset(faqs, request)
            serializer = FAQSerializer(page, many=True, context={"request": request})

            response = {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "FAQ list fetched successfully.",
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
                "message": "Server error while fetching FAQ list.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    tags=["FAQ'S (Admin)"],
    summary="FAQ Details By ID API",
    request=FAQSerializer,
    responses={
        200: OpenApiResponse(description="FAQ details fetched successfully"),
        500: OpenApiResponse(description="Server error"),
    },
)
class FAQDetailAPIView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, faq_id):
        try:
            faq = FAQ.objects.filter(id=faq_id, isDeleted=False).first()

            if not faq:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "FAQ not found."
                }, status=status.HTTP_404_NOT_FOUND)

            serializer = FAQSerializer(faq, context={"request": request})

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "FAQ details fetched successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while fetching FAQ details.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    tags=["FAQ'S (Admin)"],
    summary="Update Faqs by ID",
    request=FAQSerializer,
    responses={
        200: OpenApiResponse(description="Faqs updated successfully"),
        400: OpenApiResponse(description="Validation failed"),
        500: OpenApiResponse(description="Server error"),
    },
)
class FAQUpdateAPIView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]  # <-- ensures request.user is AdminUser

    def put(self, request, faq_id):
        try:
            faq = FAQ.objects.filter(id=faq_id, isDeleted=False).first()

            if not faq:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "FAQ not found."
                }, status=status.HTTP_404_NOT_FOUND)

            serializer = FAQSerializer(faq, data=request.data, partial=True, context={"request": request})

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "FAQ updated successfully.",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)


            #  ONLY CHANGE STARTS HERE
            if "title" in serializer.errors:
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Validation failed;FAQ with this title already exists"
                }, status=status.HTTP_200_OK)
            #  ONLY CHANGE ENDS HERE
                
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
                "message": "Server error while updating FAQ.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    tags=["FAQ'S (Admin)"],
    summary="Delete FAQ by ID",
    description="Soft delete a FAQ and all its related descriptions.",
    responses={
        200: OpenApiResponse(description="FAQ deleted successfully"),
        404: OpenApiResponse(description="FAQ not found"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
class FAQDeleteAPIView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]  # <-- ensures request.user is AdminUser

    def delete(self, request, faq_id):
        try:
            faq = FAQ.objects.filter(id=faq_id, isDeleted=False).first()

            if not faq:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "FAQ not found."
                }, status=status.HTTP_404_NOT_FOUND)

            # Soft delete FAQ and all its descriptions
            faq.isDeleted = True
            faq.save()
            faq.descriptions.update(isDeleted=True)

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "FAQ deleted successfully."
            }, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while deleting FAQ.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)








