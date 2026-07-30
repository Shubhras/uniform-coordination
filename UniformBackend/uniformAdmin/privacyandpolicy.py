from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import PrivacyPolicy
from .serializers import PrivacyPolicySerializer
from .fabric import CustomPagination ,IsAdministrator # same paginator you already use
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated ,BasePermission,AllowAny
from .utils import*
from drf_spectacular.utils import extend_schema,OpenApiExample,OpenApiResponse,OpenApiParameter,OpenApiTypes



@extend_schema(
    tags=["Privacy Policy"],
    summary="Create Privacy Policy",
    description="Admin only API to create a new privacy policy.",
    request=PrivacyPolicySerializer,
    responses={
        200: OpenApiResponse(description="Privacy policy created successfully"),
        400: OpenApiResponse(description="Validation error"),
        401: OpenApiResponse(description="Unauthorized"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
class PrivacyPolicyCreateAPIView(BaseAPIView):   
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        try:
            serializer = PrivacyPolicySerializer(data=request.data)

            if serializer.is_valid():
                serializer.save()
                return self.success_response(
                    "Privacy policy created successfully",
                    serializer.data
                )

            #  Proper serializer validation handling
            return self.error_response(serializer.errors)

        except Exception as e:
            #  Catch ANY unexpected runtime error safely
            return self.error_response(f"Internal server error: {str(e)}")



@extend_schema(
    tags=["Privacy Policy"],
    summary="List Privacy Policies",
    description="Public API to fetch privacy policies with search and filters.",
    parameters=[
        OpenApiParameter(
            name="search",
            description="Search by title",
            required=False,
            type=str,
        ),
        OpenApiParameter(
            name="privacyPolicyType",
            description="Filter by privacy policy type",
            required=False,
            type=str,
        ),
        OpenApiParameter(
            name="type",
            description="Filter by policy type",
            required=False,
            type=str,
        ),
        OpenApiParameter(
            name="page",
            description="Page number",
            required=False,
            type=int,
        ),
        OpenApiParameter(
            name="page_size",
            description="Page size",
            required=False,
            type=int,
        ),
    ],
    responses={
        200: OpenApiResponse(description="Privacy policy list fetched successfully"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
class PrivacyPolicyListAPIView(BaseAPIView):
    # permission_classes = [AllowAny]
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        try:
            search_query = request.query_params.get("search", "").strip()
            privacy_policy_type = request.query_params.get("privacyPolicyType")
            policy_type = request.query_params.get("type")

            queryset = PrivacyPolicy.objects.filter(isDeleted=False)

            # Search on title
            if search_query:
                queryset = queryset.filter(
                    title__icontains=search_query
                )

            # Filter on privacyPolicyType
            if privacy_policy_type:
                queryset = queryset.filter(
                    privacyPolicyType=privacy_policy_type
                )

            # Filter on type
            if policy_type:
                queryset = queryset.filter(
                    type=policy_type
                )

            queryset = queryset.order_by("-id")

            paginator = CustomPagination()
            page = paginator.paginate_queryset(queryset, request)
            serializer = PrivacyPolicySerializer(page, many=True)

            response = {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "pagination": {
                    "page": paginator.page.number,
                    "page_size": paginator.get_page_size(request),
                    "total_pages": paginator.page.paginator.num_pages,
                    "total_items": paginator.page.paginator.count
                },
                "statusCode": 200,
                "status": True,
                "message": "Privacy policy list fetched successfully",
                "data": serializer.data,
              
            }

            return Response(response)

        except Exception as e:
            return self.error_response(f"Internal server error: {str(e)}")



@extend_schema(
    tags=["Privacy Policy"],
    summary="Privacy Policy Detail",
    description="Fetch a single privacy policy by ID.",
    parameters=[
        OpenApiParameter(
            name="pk",
            description="Privacy policy ID",
            required=True,
            type=int,
            location=OpenApiParameter.PATH,
        )
    ],
    responses={
        200: OpenApiResponse(description="Privacy policy fetched successfully"),
        404: OpenApiResponse(description="Privacy policy not found"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
class PrivacyPolicyDetailAPIView(BaseAPIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            policy = get_object_or_404(
                PrivacyPolicy, pk=pk, isDeleted=False
            )
            serializer = PrivacyPolicySerializer(policy)
            return self.success_response(
                "Privacy policy detail fetched",
                serializer.data
            )
        except Exception as e:
            return self.error_response(f"Internal server error: {str(e)}")


@extend_schema(
    tags=["Privacy Policy"],
    summary="Update Privacy Policy",
    description="Admin only API to update privacy policy.",
    request=PrivacyPolicySerializer,
    parameters=[
        OpenApiParameter(
            name="pk",
            description="Privacy policy ID",
            required=True,
            type=int,
            location=OpenApiParameter.PATH,
        )
    ],
    responses={
        200: OpenApiResponse(description="Privacy policy updated successfully"),
        400: OpenApiResponse(description="Validation error"),
        401: OpenApiResponse(description="Unauthorized"),
        404: OpenApiResponse(description="Privacy policy not found"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
class PrivacyPolicyUpdateAPIView(BaseAPIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def put(self, request, pk):
        try:
            policy = get_object_or_404(
                PrivacyPolicy, pk=pk, isDeleted=False
            )
            serializer = PrivacyPolicySerializer(
                policy, data=request.data, partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return self.success_response(
                    "Privacy policy updated successfully",
                    serializer.data
                )
            return self.error_response(serializer.errors)
        except Exception as e:
            return self.error_response(f"Internal server error: {str(e)}")




class PrivacyPolicyDeleteAPIView(BaseAPIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    @extend_schema(
    tags=["Privacy Policy"],
    summary="Delete Privacy Policy",
    description="Admin only API to soft delete a privacy policy.",
    parameters=[
        OpenApiParameter(
            name="pk",
            description="Privacy policy ID",
            required=True,
            type=int,
            location=OpenApiParameter.PATH,
        )
    ],
    responses={
        200: OpenApiResponse(description="Privacy policy deleted successfully"),
        401: OpenApiResponse(description="Unauthorized"),
        404: OpenApiResponse(description="Privacy policy not found"),
        500: OpenApiResponse(description="Internal server error"),
    },
)

    def delete(self, request, pk):
        try:
            policy = get_object_or_404(
                PrivacyPolicy, pk=pk, isDeleted=False
            )
            policy.isDeleted = True
            policy.isActive = False
            policy.save()

            return self.success_response(
                "Privacy policy deleted successfully"
            )
        except Exception as e:
            return self.error_response(f"Internal server error: {str(e)}")
