from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from .models import Menu, SubMenu
from .serializers import MenuSerializer, SubMenuSerializer
from .auth import IsAdminUserJWT

# --- Menu CRUD Views ---

class MenuCreateView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Menu Management"],
        summary="Create a new Menu",
        request=MenuSerializer,
        responses={201: OpenApiResponse(description="Menu created successfully")}
    )
    def post(self, request):
        serializer = MenuSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "statusCode": 201,
                "status": True,
                "message": "Menu created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "statusCode": 400,
            "status": False,
            "message": "Validation Error",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class MenuListView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Menu Management"],
        summary="List all Menus",
        parameters=[
            OpenApiParameter(name="menu_id", description="Filter by Menu ID", required=False, type=int)
        ],
        responses={200: OpenApiResponse(description="Menu list retrieved successfully")}
    )
    def get(self, request):
        menu_id = request.query_params.get("menu_id")
        menus = Menu.objects.filter(isDeleted=False)
        if menu_id:
            menus = menus.filter(id=menu_id)
        menus = menus.order_by("order")
        serializer = MenuSerializer(menus, many=True)
        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Menu list retrieved successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class MenuDetailView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Menu Management"],
        summary="Get Menu detail by ID",
        responses={200: OpenApiResponse(description="Menu detail retrieved successfully")}
    )
    def get(self, request, pk):
        menu = get_object_or_404(Menu, id=pk, isDeleted=False)
        serializer = MenuSerializer(menu)
        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Menu detail retrieved successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class MenuUpdateView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Menu Management"],
        summary="Update a Menu",
        request=MenuSerializer,
        responses={200: OpenApiResponse(description="Menu updated successfully")}
    )
    def put(self, request, pk):
        menu = get_object_or_404(Menu, id=pk, isDeleted=False)
        serializer = MenuSerializer(menu, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Menu updated successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        return Response({
            "statusCode": 400,
            "status": False,
            "message": "Validation Error",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class MenuDeleteView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Menu Management"],
        summary="Delete a Menu (Soft Delete)",
        responses={200: OpenApiResponse(description="Menu deleted successfully")}
    )
    def delete(self, request, pk):
        menu = get_object_or_404(Menu, id=pk, isDeleted=False)
        menu.isDeleted = True
        menu.isActive = False
        menu.save()
        
        # Soft delete child submenus
        menu.submenus.update(isDeleted=True, isActive=False)

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Menu and associated submenus deleted successfully"
        }, status=status.HTTP_200_OK)


# --- SubMenu CRUD Views ---

class SubMenuCreateView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["SubMenu Management"],
        summary="Create a new SubMenu",
        request=SubMenuSerializer,
        responses={201: OpenApiResponse(description="SubMenu created successfully")}
    )
    def post(self, request):
        serializer = SubMenuSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "statusCode": 201,
                "status": True,
                "message": "SubMenu created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "statusCode": 400,
            "status": False,
            "message": "Validation Error",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class SubMenuListView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["SubMenu Management"],
        summary="List all SubMenus",
        responses={200: OpenApiResponse(description="SubMenu list retrieved successfully")}
    )
    def get(self, request):
        submenus = SubMenu.objects.filter(isDeleted=False).order_by("order")
        serializer = SubMenuSerializer(submenus, many=True)
        return Response({
            "statusCode": 200,
            "status": True,
            "message": "SubMenu list retrieved successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class SubMenuDetailView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["SubMenu Management"],
        summary="Get SubMenu detail by ID",
        responses={200: OpenApiResponse(description="SubMenu detail retrieved successfully")}
    )
    def get(self, request, pk):
        submenu = get_object_or_404(SubMenu, id=pk, isDeleted=False)
        serializer = SubMenuSerializer(submenu)
        return Response({
            "statusCode": 200,
            "status": True,
            "message": "SubMenu detail retrieved successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class SubMenuUpdateView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["SubMenu Management"],
        summary="Update a SubMenu",
        request=SubMenuSerializer,
        responses={200: OpenApiResponse(description="SubMenu updated successfully")}
    )
    def put(self, request, pk):
        submenu = get_object_or_404(SubMenu, id=pk, isDeleted=False)
        serializer = SubMenuSerializer(submenu, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "statusCode": 200,
                "status": True,
                "message": "SubMenu updated successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        return Response({
            "statusCode": 400,
            "status": False,
            "message": "Validation Error",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class SubMenuDeleteView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["SubMenu Management"],
        summary="Delete a SubMenu (Soft Delete)",
        responses={200: OpenApiResponse(description="SubMenu deleted successfully")}
    )
    def delete(self, request, pk):
        submenu = get_object_or_404(SubMenu, id=pk, isDeleted=False)
        submenu.isDeleted = True
        submenu.isActive = False
        submenu.save()
        return Response({
            "statusCode": 200,
            "status": True,
            "message": "SubMenu deleted successfully"
        }, status=status.HTTP_200_OK)
