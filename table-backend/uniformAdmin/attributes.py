from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .serializers import (
    TableShapeSerializer,
    ClosureSerializer,
    StyleSerializer,
    SizeSerializer,
    PatternSerializer,
)
from .models import TableShape, Closure, Style, Size, Pattern
from .fabric import IsAdministrator, CustomPagination
from drf_spectacular.utils import extend_schema, OpenApiResponse


def create_attribute_crud_views(model_cls, serializer_cls, name_singular, tag_name):
    """
    Helper function or class pattern generator for dynamic attributes.
    We define standard APIViews for each attribute model.
    """
    pass


# =======================================================
# 1. TABLE SHAPE VIEWS
# =======================================================
@extend_schema(tags=["Table Shapes"], summary="Create Table Shape")
class TableShapeCreateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        try:
            serializer = TableShapeSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "statusCode": 200,
                    "status": True,
                    "message": "Table Shape created successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            return Response({"statusCode": 400, "status": False, "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"statusCode": 500, "status": False, "message": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(tags=["Table Shapes"], summary="List Table Shapes")
class TableShapeListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            search = request.query_params.get("search", "").strip()
            qs = TableShape.objects.filter(isDeleted=False)
            if search:
                qs = qs.filter(name__icontains=search)
            qs = qs.order_by("-id")

            paginator = CustomPagination()
            page = paginator.paginate_queryset(qs, request)
            serializer = TableShapeSerializer(page, many=True)
            return Response({
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Table Shapes fetched successfully",
                "data": serializer.data,
            })
        except Exception as e:
            return Response({"statusCode": 500, "status": False, "message": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(tags=["Table Shapes"], summary="Get Table Shape Details")
class TableShapeDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, id):
        obj = TableShape.objects.filter(id=id, isDeleted=False).first()
        if not obj:
            return Response({"statusCode": 404, "status": False, "message": "Table Shape not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = TableShapeSerializer(obj)
        return Response({"statusCode": 200, "status": True, "data": serializer.data})


@extend_schema(tags=["Table Shapes"], summary="Update Table Shape")
class TableShapeUpdateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def put(self, request, id):
        obj = TableShape.objects.filter(id=id, isDeleted=False).first()
        if not obj:
            return Response({"statusCode": 404, "status": False, "message": "Table Shape not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = TableShapeSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"statusCode": 200, "status": True, "message": "Table Shape updated successfully", "data": serializer.data})
        return Response({"statusCode": 400, "status": False, "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=["Table Shapes"], summary="Delete Table Shape")
class TableShapeDeleteView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def delete(self, request, id):
        obj = TableShape.objects.filter(id=id, isDeleted=False).first()
        if not obj:
            return Response({"statusCode": 404, "status": False, "message": "Table Shape not found"}, status=status.HTTP_404_NOT_FOUND)
        obj.isDeleted = True
        obj.save()
        return Response({"statusCode": 200, "status": True, "message": "Table Shape deleted successfully"})


# =======================================================
# 2. CLOSURE VIEWS
# =======================================================
@extend_schema(tags=["Closures"], summary="Create Closure")
class ClosureCreateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        try:
            serializer = ClosureSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({"statusCode": 200, "status": True, "message": "Closure created successfully", "data": serializer.data})
            return Response({"statusCode": 400, "status": False, "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"statusCode": 500, "status": False, "message": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(tags=["Closures"], summary="List Closures")
class ClosureListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            search = request.query_params.get("search", "").strip()
            qs = Closure.objects.filter(isDeleted=False)
            if search:
                qs = qs.filter(name__icontains=search)
            qs = qs.order_by("-id")

            paginator = CustomPagination()
            page = paginator.paginate_queryset(qs, request)
            serializer = ClosureSerializer(page, many=True)
            return Response({
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Closures fetched successfully",
                "data": serializer.data,
            })
        except Exception as e:
            return Response({"statusCode": 500, "status": False, "message": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(tags=["Closures"], summary="Get Closure Details")
class ClosureDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, id):
        obj = Closure.objects.filter(id=id, isDeleted=False).first()
        if not obj:
            return Response({"statusCode": 404, "status": False, "message": "Closure not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ClosureSerializer(obj)
        return Response({"statusCode": 200, "status": True, "data": serializer.data})


@extend_schema(tags=["Closures"], summary="Update Closure")
class ClosureUpdateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def put(self, request, id):
        obj = Closure.objects.filter(id=id, isDeleted=False).first()
        if not obj:
            return Response({"statusCode": 404, "status": False, "message": "Closure not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ClosureSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"statusCode": 200, "status": True, "message": "Closure updated successfully", "data": serializer.data})
        return Response({"statusCode": 400, "status": False, "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=["Closures"], summary="Delete Closure")
class ClosureDeleteView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def delete(self, request, id):
        obj = Closure.objects.filter(id=id, isDeleted=False).first()
        if not obj:
            return Response({"statusCode": 404, "status": False, "message": "Closure not found"}, status=status.HTTP_404_NOT_FOUND)
        obj.isDeleted = True
        obj.save()
        return Response({"statusCode": 200, "status": True, "message": "Closure deleted successfully"})


# =======================================================
# 3. STYLE VIEWS
# =======================================================
@extend_schema(tags=["Styles"], summary="Create Style")
class StyleCreateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        try:
            serializer = StyleSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({"statusCode": 200, "status": True, "message": "Style created successfully", "data": serializer.data})
            return Response({"statusCode": 400, "status": False, "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"statusCode": 500, "status": False, "message": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(tags=["Styles"], summary="List Styles")
class StyleListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            search = request.query_params.get("search", "").strip()
            qs = Style.objects.filter(isDeleted=False)
            if search:
                qs = qs.filter(name__icontains=search)
            qs = qs.order_by("-id")

            paginator = CustomPagination()
            page = paginator.paginate_queryset(qs, request)
            serializer = StyleSerializer(page, many=True)
            return Response({
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Styles fetched successfully",
                "data": serializer.data,
            })
        except Exception as e:
            return Response({"statusCode": 500, "status": False, "message": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(tags=["Styles"], summary="Get Style Details")
class StyleDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, id):
        obj = Style.objects.filter(id=id, isDeleted=False).first()
        if not obj:
            return Response({"statusCode": 404, "status": False, "message": "Style not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = StyleSerializer(obj)
        return Response({"statusCode": 200, "status": True, "data": serializer.data})


@extend_schema(tags=["Styles"], summary="Update Style")
class StyleUpdateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def put(self, request, id):
        obj = Style.objects.filter(id=id, isDeleted=False).first()
        if not obj:
            return Response({"statusCode": 404, "status": False, "message": "Style not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = StyleSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"statusCode": 200, "status": True, "message": "Style updated successfully", "data": serializer.data})
        return Response({"statusCode": 400, "status": False, "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=["Styles"], summary="Delete Style")
class StyleDeleteView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def delete(self, request, id):
        obj = Style.objects.filter(id=id, isDeleted=False).first()
        if not obj:
            return Response({"statusCode": 404, "status": False, "message": "Style not found"}, status=status.HTTP_404_NOT_FOUND)
        obj.isDeleted = True
        obj.save()
        return Response({"statusCode": 200, "status": True, "message": "Style deleted successfully"})


# =======================================================
# 4. SIZE VIEWS
# =======================================================
@extend_schema(tags=["Sizes"], summary="Create Size")
class SizeCreateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        try:
            serializer = SizeSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({"statusCode": 200, "status": True, "message": "Size created successfully", "data": serializer.data})
            return Response({"statusCode": 400, "status": False, "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"statusCode": 500, "status": False, "message": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(tags=["Sizes"], summary="List Sizes")
class SizeListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            search = request.query_params.get("search", "").strip()
            qs = Size.objects.filter(isDeleted=False)
            if search:
                qs = qs.filter(name__icontains=search)
            qs = qs.order_by("-id")

            paginator = CustomPagination()
            page = paginator.paginate_queryset(qs, request)
            serializer = SizeSerializer(page, many=True)
            return Response({
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Sizes fetched successfully",
                "data": serializer.data,
            })
        except Exception as e:
            return Response({"statusCode": 500, "status": False, "message": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(tags=["Sizes"], summary="Get Size Details")
class SizeDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, id):
        obj = Size.objects.filter(id=id, isDeleted=False).first()
        if not obj:
            return Response({"statusCode": 404, "status": False, "message": "Size not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = SizeSerializer(obj)
        return Response({"statusCode": 200, "status": True, "data": serializer.data})


@extend_schema(tags=["Sizes"], summary="Update Size")
class SizeUpdateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def put(self, request, id):
        obj = Size.objects.filter(id=id, isDeleted=False).first()
        if not obj:
            return Response({"statusCode": 404, "status": False, "message": "Size not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = SizeSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"statusCode": 200, "status": True, "message": "Size updated successfully", "data": serializer.data})
        return Response({"statusCode": 400, "status": False, "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=["Sizes"], summary="Delete Size")
class SizeDeleteView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def delete(self, request, id):
        obj = Size.objects.filter(id=id, isDeleted=False).first()
        if not obj:
            return Response({"statusCode": 404, "status": False, "message": "Size not found"}, status=status.HTTP_404_NOT_FOUND)
        obj.isDeleted = True
        obj.save()
        return Response({"statusCode": 200, "status": True, "message": "Size deleted successfully"})


# =======================================================
# 5. PATTERN VIEWS
# =======================================================
@extend_schema(tags=["Patterns"], summary="Create Pattern")
class PatternCreateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        try:
            serializer = PatternSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({"statusCode": 200, "status": True, "message": "Pattern created successfully", "data": serializer.data})
            return Response({"statusCode": 400, "status": False, "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"statusCode": 500, "status": False, "message": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(tags=["Patterns"], summary="List Patterns")
class PatternListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            search = request.query_params.get("search", "").strip()
            qs = Pattern.objects.filter(isDeleted=False)
            if search:
                qs = qs.filter(name__icontains=search)
            qs = qs.order_by("-id")

            paginator = CustomPagination()
            page = paginator.paginate_queryset(qs, request)
            serializer = PatternSerializer(page, many=True)
            return Response({
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Patterns fetched successfully",
                "data": serializer.data,
            })
        except Exception as e:
            return Response({"statusCode": 500, "status": False, "message": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(tags=["Patterns"], summary="Get Pattern Details")
class PatternDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, id):
        obj = Pattern.objects.filter(id=id, isDeleted=False).first()
        if not obj:
            return Response({"statusCode": 404, "status": False, "message": "Pattern not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = PatternSerializer(obj)
        return Response({"statusCode": 200, "status": True, "data": serializer.data})


@extend_schema(tags=["Patterns"], summary="Update Pattern")
class PatternUpdateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def put(self, request, id):
        obj = Pattern.objects.filter(id=id, isDeleted=False).first()
        if not obj:
            return Response({"statusCode": 404, "status": False, "message": "Pattern not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = PatternSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"statusCode": 200, "status": True, "message": "Pattern updated successfully", "data": serializer.data})
        return Response({"statusCode": 400, "status": False, "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=["Patterns"], summary="Delete Pattern")
class PatternDeleteView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def delete(self, request, id):
        obj = Pattern.objects.filter(id=id, isDeleted=False).first()
        if not obj:
            return Response({"statusCode": 404, "status": False, "message": "Pattern not found"}, status=status.HTTP_404_NOT_FOUND)
        obj.isDeleted = True
        obj.save()
        return Response({"statusCode": 200, "status": True, "message": "Pattern deleted successfully"})
