from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated ,BasePermission,AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .serializers import *
from .models import *
from .fabric import IsAdministrator, CustomPagination



class TemplateCreateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        try:
            serializer = TemplateSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save()

                return Response({
                    "statusCode": 200,
                    "status": True,
                    "message": "Template created successfully",
                    "data": serializer.data
                })

            return Response({
                "statusCode": 400,
                "status": False,
                "message": serializer.errors
            })

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal Server Error: {str(e)}"
            }, status=500)


class TemplateListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            search = request.query_params.get("search", "").strip()

            templates = Template.objects.filter(isDeleted=False)

            if search:
                templates = templates.filter(
                    Q(templateName__icontains=search) |
                    Q(part__partName__icontains=search)
                )

            templates = templates.order_by("-id")

            paginator = CustomPagination()
            page = paginator.paginate_queryset(templates, request)
            serializer = TemplateSerializer(page, many=True)

            return Response({
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Templates fetched successfully",
                "data": serializer.data,
                "pagination": {
                    "page": paginator.page.number,
                    "page_size": paginator.get_page_size(request),
                    "total_pages": paginator.page.paginator.num_pages,
                    "total_items": paginator.page.paginator.count
                }
            })

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal Server Error: {str(e)}"
            })


class TemplateDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, id):
        try:
            template = Template.objects.filter(id=id, isDeleted=False).first()

            if not template:
                return Response({
                    "statusCode": 404,
                    "status": False,
                    "message": "Template not found"
                })

            serializer = TemplateSerializer(template)

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Template fetched successfully",
                "data": serializer.data
            })

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            })


class TemplateUpdateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def put(self, request, pk):
        try:
            template = Template.objects.filter(pk=pk, isDeleted=False).first()
            if not template:
                return Response({
                    "statusCode": 404,
                    "status": False,
                    "message": "Template not found"
                })

            serializer = TemplateSerializer(template, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()

                return Response({
                    "statusCode": 200,
                    "status": True,
                    "message": "Template updated successfully",
                    "data": serializer.data
                })

            return Response({
                "statusCode": 400,
                "status": False,
                "message": serializer.errors
            })

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal Server Error: {str(e)}"
            })


class TemplateDeleteView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def delete(self, request, pk):
        try:
            template = Template.objects.filter(pk=pk, isDeleted=False).first()
            if not template:
                return Response({
                    "statusCode": 404,
                    "status": False,
                    "message": "Template not found"
                })

            template.isDeleted = True
            template.save()

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Template deleted successfully"
            })

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal Server Error: {str(e)}"
            })
