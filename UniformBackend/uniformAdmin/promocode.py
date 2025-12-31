from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated ,BasePermission,AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from django.db.models import Q
from rest_framework import status

from rest_framework.permissions import AllowAny
from .models import Promocode
from rest_framework.views import APIView

from .serializers import PromocodeSerializer
from userhub.utils import BaseAPIView
from .fabric import IsAdministrator, CustomPagination
from rest_framework.exceptions import ValidationError







class PromocodeCreateAPIView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication] 

    def post(self, request):
        try:
            serializer = PromocodeSerializer(
                data=request.data,
                context={"request": request}
            )

            if serializer.is_valid():
                promocode = serializer.save()
                data = serializer.data

                #  FIX IMAGE ABSOLUTE URL
                if data.get("promocodeImage"):
                    data["promocodeImage"] = request.build_absolute_uri(
                        data["promocodeImage"]
                    )

                return self.success_response(
                    "Promocode created successfully",
                    data
                )

            return self.error_response(serializer.errors)

        except ValidationError as e:
            #  Handles serializer / DRF validation errors cleanly
            return self.error_response(e.detail)

        except Exception as e:
            #  Handles any unexpected runtime error
            return self.error_response(str(e))

        except Exception as e:
            return self.error_response(
                f"Internal server error: {str(e)}"
            )


class PromocodeListAPIView(BaseAPIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            search_query = request.query_params.get("search", "").strip()

            queryset = Promocode.objects.filter(isDeleted=False)

            if search_query:
                queryset = queryset.filter(
                    Q(promocodeName__icontains=search_query)
                )

            queryset = queryset.order_by("-id")

            paginator = CustomPagination()
            page = paginator.paginate_queryset(queryset, request)

            serializer = PromocodeSerializer(
                page,
                many=True,
                context={"request": request}
            )

            response = {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Promocode list fetched",
                "data": serializer.data,
                "pagination": {
                    "page": paginator.page.number,
                    "page_size": paginator.get_page_size(request),
                    "total_pages": paginator.page.paginator.num_pages,
                    "total_items": paginator.page.paginator.count,
                },
            }

            return Response(response, status=status.HTTP_200_OK)

        except Exception as e:
            return self.error_response(f"Internal server error: {str(e)}")


        # except Exception as e:
        #     return self.error_response(
        #         f"Internal server error: {str(e)}"
        #     )



class PromocodeDetailAPIView(BaseAPIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            promocode = Promocode.objects.get(
                pk=pk,
                isDeleted=False
            )

            serializer = PromocodeSerializer(
                promocode,
                context={"request": request}
            )

            return self.success_response(
                "Promocode detail fetched",
                serializer.data
            )

        except Promocode.DoesNotExist:
            return self.error_response(
                "Promocode not found."
            )

        except Exception as e:
            return self.error_response(f"Internal server error: {str(e)}")

        # except Exception as e:
        #     return self.error_response(
        #         f"Internal server error: {str(e)}"
        #     )



class PromocodeUpdateAPIView(BaseAPIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def put(self, request, pk):
        try:
            promocode = Promocode.objects.get(
                pk=pk,
                isDeleted=False
            )

            serializer = PromocodeSerializer(
                promocode,
                data=request.data,
                partial=True,
                context={"request": request}
            )

            if serializer.is_valid():
                serializer.save()
                return self.success_response(
                    "Promocode updated successfully",
                    serializer.data
                )

            return self.error_response(serializer.errors)

        except Promocode.DoesNotExist:
            return self.error_response(
                "Promocode not found."
            )

        except Exception as e:
            return self.error_response(f"Internal server error: {str(e)}")


class PromocodeDeleteAPIView(BaseAPIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def delete(self, request, pk):
        try:
            promocode = Promocode.objects.get(
                pk=pk,
                isDeleted=False
            )

            promocode.isDeleted = True
            promocode.isActive = False
            promocode.save()

            return self.success_response(
                "Promocode deleted successfully"
            )

        except Promocode.DoesNotExist:
            return self.error_response(
                "Promocode not found."
            )

        except Exception as e:
            return self.error_response(f"Internal server error: {str(e)}")
