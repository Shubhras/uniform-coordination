from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated ,BasePermission,AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .serializers import *
from .models import *
from .fabric import IsAdministrator, CustomPagination
from rest_framework import status



class PartsCreateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication] 

    def post(self, request):
        try:
            serializer = PartsSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "statusCode": 200,
                    "status": True,
                    "message": "Part created successfully",
                    "data": serializer.data
                })
                
                
            if "theme" in serializer.errors:
                error_msg = serializer.errors["theme"][0]

                if "not allowed" in error_msg:
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": "Theme is not allowed for Uniform"
                    }, status=status.HTTP_200_OK)

                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Validation failed;Please Select Themes"
                }, status=status.HTTP_200_OK)
            
                

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


class PartsListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            search_query = request.query_params.get("search", "").strip()

            parts = Parts.objects.filter(isDeleted=False)

            if search_query:
                parts = parts.filter(
                    Q(partName__icontains=search_query) |
                    Q(category__icontains=search_query) |
                    Q(fabric__fabricName__icontains=search_query)
                )

            parts = parts.order_by("-id")

            paginator = CustomPagination()
            page = paginator.paginate_queryset(parts, request)
            serializer = PartsSerializer(page, many=True)

            response = {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Parts list fetched successfully",
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

class PartsDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            part = Parts.objects.filter(id=pk, isDeleted=False).first()

            if not part:
                return Response({
                    "statusCode": 404,
                    "status": False,
                    "message": "Part not found"
                })

            serializer = PartsSerializer(part)

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Part fetched successfully",
                "data": serializer.data
            })

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal Server Error: {str(e)}"
            })

class PartsUpdateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication] 

    def put(self, request, pk):
        try:
            part = Parts.objects.filter(id=pk).first()

            if not part:
                return Response({
                    "statusCode": 404,
                    "status": False,
                    "message": "Part not found"
                })

            serializer = PartsSerializer(part, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "statusCode": 200,
                    "status": True,
                    "message": "Part updated successfully",
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

class PartsDeleteView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def delete(self, request, pk):
        try:
            part = Parts.objects.filter(id=pk).first()

            if not part:
                return Response({
                    "statusCode": 404,
                    "status": False,
                    "message": "Part not found"
                })

            part.isDeleted = True
            part.save()

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Part deleted successfully"
            })

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal Server Error: {str(e)}"
            })
