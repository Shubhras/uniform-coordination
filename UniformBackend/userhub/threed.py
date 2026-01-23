from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from rest_framework.permissions import IsAuthenticated
from .utils import *
from django.shortcuts import get_object_or_404
from .serializers import*
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings
import os
from .util.file_storage import save_large_json_to_file
from uniformAdmin.signal import create_admin_notification
from uniformAdmin.models import *
from uniformAdmin.utils import *
import pdfkit
from django.utils.timezone import now
from uniformAdmin.models import QuotationTemplate
from rest_framework.permissions import IsAuthenticated ,BasePermission,AllowAny
from contracts.utils import *
from userhub.utils import generate_quotation_pdf
from contracts.models import DocuSignEnvelope
from django.utils import timezone
from drf_spectacular.utils import extend_schema,OpenApiExample,OpenApiResponse,OpenApiParameter,OpenApiTypes



#<-------------------ModelsInfo------------------->
class ModelInfoCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
    tags=["Model Info"],
    summary="Create 3D model info",
    description="Create a new 3D model information entry.",
    request=ModelInfoSerializer,
    responses={
        201: OpenApiResponse(description="Model info created successfully"),
        500: OpenApiResponse(description="Server error"),
    },
)
    def post(self,request):
        try:
            serializer = ModelInfoSerializer(data=request.data)
            if serializer.is_valid():
                model_info = serializer.save()
                return Response({
                    'statusCode' : 201,
                    'status':True,
                    "message": "3D model information created successfully",
                    "data": ModelInfoSerializer(model_info).data
                },status=status.HTTP_201_CREATED)
            else:
                return Response({
                    "statusCode":400,
                    "status":False,
                    "message":"Invalid Product id",
                    "error":serializer.errors
                },status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'statusCode':500,
                'status':False,
                "message": "Something went wrong on server",
                "details": str(e)
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
class ModelInfoListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
    tags=["Model Info"],
    summary="List model info",
    description="Fetch all model info records. Optional filtering by comma-separated IDs.",
    parameters=[
        OpenApiParameter(
            name="ids",
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            description="Comma-separated model info IDs (e.g. 1,2,3)",
            required=False,
        )
    ],
    responses={
        200: OpenApiResponse(description="Model info fetched successfully"),
        400: OpenApiResponse(description="Invalid ID format"),
    },
    )
    def get(self,request):
        model_Info = ModelInfo.objects.filter(isDeleted=False).order_by('-created_at') 
        ids = request.GET.get("ids")
        if ids:
            try:
                id_list = [int(i.strip()) for i in ids.split(",")]
                model_Info = model_Info.filter(id_in = id_list)
            except ValueError:
                return Response({
                    'status':False,
                    'message':'Invalid ID format',
                },status=status.HTTP_400_BAD_REQUEST)
            
        serializer = ModelInfoSerializer(model_Info,many=True, context={'request': request})
        return Response({
            'statusCode':200,
            'status':True,
            'message': 'Model info fetched successfully',
            'data':serializer.data

        },status=status.HTTP_200_OK)


class ModelInfoDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
    tags=["Model Info"],
    summary="Get model info detail",
    description="Fetch model info details by ID.",
    responses={
        200: OpenApiResponse(
            description="Model info fetched successfully",
            response=ModelInfoSerializer
        ),
        404: OpenApiResponse(description="Model info not found"),
    },
)
    def get(self,request,id):
        model_info = get_object_or_404(
            ModelInfo,
            id=id,
            isDeleted=False
        )
        serializer = ModelInfoSerializer(model_info,context={'request': request})
        return Response({
            'statusCode':200,
            'status':True,
            'message':'Model info fetched successfully',
            'data':serializer.data
        },status=status.HTTP_200_OK)

    
class ModelInfoUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
    tags=["Model Info"],
    summary="Update model info",
    description="Update an existing model info record.",
    request=ModelInfoSerializer,
    responses={
        200: OpenApiResponse(description="Model info updated successfully"),
        400: OpenApiResponse(description="Invalid data"),
        404: OpenApiResponse(description="Model info not found"),
    },
    )
    
    def put(self,request,id):
        model_info = get_object_or_404(
            ModelInfo,
            id=id,
            isDeleted=False
        )
        
        serializer = ModelInfoSerializer(
            model_info,
            data=request.data,
            partial = True
        )

        if serializer.is_valid():
            serializer.save()
            return Response({
                'statusCode':200,
                'status':True,
                "message": "Model info updated successfully",
                "data": serializer.data
            },status=status.HTTP_200_OK)
        
        return Response({
            'statusCode':400,
            'status':False,
            'message':"Invalid data",
            "errors": serializer.errors
        },status=status.HTTP_400_BAD_REQUEST)


class ModelInfoDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    
    @extend_schema(
    tags=["Model Info"],
    summary="Delete model info",
    description=(
        "Delete model info records.\n\n"
        "- Single delete: pass `id` in URL\n"
        "- Bulk delete: pass list of IDs in request body\n"
        "- Delete all: pass `id = 'all'` in request body"
    ),
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "id": {
                    "oneOf": [
                        {"type": "string", "example": "all"},
                        {
                            "type": "array",
                            "items": {"type": "integer"},
                            "example": [1, 2, 3]
                        }
                    ],
                    "description": "List of IDs or 'all'"
                }
            }
        }
    },
    responses={
        200: OpenApiResponse(description="Model info deleted successfully"),
        204: OpenApiResponse(description="Model info permanently deleted"),
        400: OpenApiResponse(description="Invalid delete request"),
        404: OpenApiResponse(description="Model info not found"),
    },
    )
    def delete(self,request,id=None):
        ids = request.data.get('id',None)
        
        #single delete
        if id:
            try:
                obj = ModelInfo.objects.get(id=id)
                obj.delete()
                return Response({
                    'statusCode':204,
                    'status':True,
                    'message':'ModelInfo permanently deleted.',
                    'data':None
                },status=status.HTTP_204_NO_CONTENT)
            
            except ModelInfo.DoesNotExist:
                return Response({
                    'statusCode':404,
                    'status':False,
                    'message':'ModelInfo not found.',
                    'data':None
                },status=status.HTTP_404_NOT_FOUND)
        

        # Delete all
        if ids == "all":
            queryset = ModelInfo.objects.all()
            count = queryset.count()
            queryset.delete()
            return Response({
                "statusCode": 200,
                "status": True,
                "message": f"All {count} ModelInfo permanently deleted.",
                "data": None
            }, status=status.HTTP_200_OK)
  # Bulk delete
        if not ids or not isinstance(ids, list):
            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Please provide a list of IDs in 'id' field or 'all'.",
                "data": None
            }, status=status.HTTP_400_BAD_REQUEST)

        queryset = ModelInfo.objects.filter(id__in=ids)
        count = queryset.count()
        queryset.delete()

        return Response({
            "statusCode": 200,
            "status": True,
            "message": f"{count} ModelInfo permanently deleted.",
            "data": None
        }, status=status.HTTP_200_OK)
    
#<-------------------------CustomUpdateModel--------------------->
'''class CustomUpdateModelExportPDFAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 🔹 Latest customization first
        queryset = CustomUpdateModel.objects.filter(
            isDeleted=False,
            user=request.user
        ).order_by("-created_at")  # latest first

        if not queryset.exists():
            return Response({
                "statusCode": 404,
                "status": False,
                "message": "No customization data found"
            }, status=404)

        # 🔹 Generate PDF
        pdf_url = generate_customization_pdf(queryset, request.user)

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "PDF generated successfully",
            "pdf_url": request.build_absolute_uri(pdf_url)
        })
'''


#<----------------------QuotationRequest------------------>
           
# class QuotationRequestCreateAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     @extend_schema(
#     tags=["Quotation Request"],
#     summary="Create quotation request and send DocuSign",
#     description=(
#         "Creates a quotation request"
#         "sends DocuSign immediately, and updates workflow status."
#     ),
#     request={
#         "application/json": {
#             "type": "object",
#             "properties": {
#                 "template_slug": {
#                     "type": "string",
#                     "example": "quotation-default"
#                 }
#             },
#             "required": ["template_slug"]
#         }
#     },
#     responses={
#         201: OpenApiResponse(
#             description="Quotation created and DocuSign sent"
#         ),
#         400: OpenApiResponse(
#             description="template_slug missing"
#         ),
#         404: OpenApiResponse(
#             description="Template not found"
#         ),
#         500: OpenApiResponse(
#             description="Server error"
#         ),
#     }
# )
#     def post(self, request):
#         try:
#             template_slug = request.data.get("template_slug")
#             if not template_slug:
#                 return Response({"message": "template_slug is required"}, status=400)

#             template = QuotationTemplate.objects.filter(
#                 slug=template_slug,
#                 is_active=True,
#                 is_deleted=False
#             ).first()

#             if not template:
#                 return Response({"message": "Template not found"}, status=404)

#             serializer = QuotationRequestSerializer(data=request.data)
#             serializer.is_valid(raise_exception=True)

#             quotation = serializer.save(
#                 template=template,
#                 workflow_status="REQUESTED",
#                 quotation_status="pending"
#             )

#             # CREATE DOCUSIGN & SEND EMAIL IMMEDIATELY
#             envelope_id = send_docusign_envelope(quotation)

#             DocuSignEnvelope.objects.create(
#                 quotation_request=quotation,
#                 envelope_id=envelope_id,
#                 status="sent",
#                 agreement_status="sent_to_client"
#             )

#             quotation.workflow_status = "SENT"
#             quotation.save()

#             return Response({
#                 "status": True,
#                 "message": "Quotation created and DocuSign sent",
#                 "quotation_id": quotation.quotation_id,
#                 "workflow_status": quotation.workflow_status
#             }, status=201)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "message": "Failed to create quotation",
#                 "error": str(e)
#             }, status=500)


# class QuotationRequestCreateAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     @extend_schema(
#         tags=["Quotation Request"],
#         summary="Create quotation request and send DocuSign",
#         description=(
#             "Creates a quotation request, "
#             "sends DocuSign immediately, and updates workflow status."
#         ),
#         request={
#             "application/json": {
#                 "type": "object",
#                 "properties": {
#                     "company_name": {"type": "string"},
#                     "contact_person": {"type": "string"},
#                     "email": {"type": "string"},
#                     "phone_number": {"type": "string"},
#                     "item_type": {"type": "string"},
#                     "material": {"type": "string"},
#                     "size_quantity": {"type": "string"},
#                     "delivery_date": {"type": "string", "format": "date"},
#                     "additional_note": {"type": "string"},
#                 },
#                 "required": ["email", "delivery_date"]
#             }
#         },
#         responses={
#             201: OpenApiResponse(description="Quotation created and DocuSign sent"),
#             400: OpenApiResponse(description="Validation error"),
#             500: OpenApiResponse(description="Server error"),
#         }
#     )
#     def post(self, request):
#         try:
#             serializer = QuotationRequestSerializer(data=request.data)
#             serializer.is_valid(raise_exception=True)

#             quotation = serializer.save(
#                 workflow_status="REQUESTED",
#                 quotation_status="pending"
#             )

#             # CREATE DOCUSIGN & SEND EMAIL IMMEDIATELY
#             envelope_id = send_docusign_envelope(quotation)

#             DocuSignEnvelope.objects.create(
#                 quotation_request=quotation,
#                 envelope_id=envelope_id,
#                 status="sent",
#                 agreement_status="sent_to_client"
#             )

#             quotation.workflow_status = "SENT"
#             quotation.save()

#             return Response(
#                 {
#                     "statusCode": 200,                    
#                     "status": True,
#                     "message": "Quotation created and DocuSign sent",
#                     "quotation_id": quotation.quotation_id,
#                     "workflow_status": quotation.workflow_status,
#                 },
#                 status=200
#             )

#         except Exception as e:
#             return Response(
#                 {
#                     "statusCode": 400,                                        
#                     "status": False,
#                     "message": "Failed to create quotation",
#                     "error": str(e),
#                 },
#                 status=500
#             )



class QuotationRequestCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Quotation Request"],
        summary="Create quotation request and send DocuSign",
        description=(
            "Creates a quotation request, "
            "sends DocuSign immediately, and updates workflow status."
        ),
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "company_name": {"type": "string"},
                    "contact_person": {"type": "string"},
                    "email": {"type": "string"},
                    "phone_number": {"type": "string"},
                    "item_type": {"type": "string"},
                    "material": {"type": "string"},
                    "size_quantity": {"type": "string"},
                    "delivery_date": {"type": "string", "format": "date"},
                    "additional_note": {"type": "string"},
                },
                "required": ["email", "delivery_date"]
            }
        },
        responses={
            201: OpenApiResponse(description="Quotation created and DocuSign sent"),
            400: OpenApiResponse(description="Validation error"),
            500: OpenApiResponse(description="Server error"),
        }
    )
    def post(self, request):
        try:
            serializer = QuotationRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            quotation = serializer.save(
                workflow_status="REQUESTED",
                quotation_status="pending"
            )

            # CREATE DOCUSIGN & SEND EMAIL IMMEDIATELY
            envelope_id = send_docusign_envelope(quotation)

            DocuSignEnvelope.objects.create(
                quotation_request=quotation,
                envelope_id=envelope_id,
                status="sent",
                agreement_status="sent_to_client"
            )

            quotation.workflow_status = "SENT"
            quotation.save()

            return Response(
                {
                    "statusCode": 201,
                    "status": True,
                    "message": "Quotation created and DocuSign sent",
                    "quotation_id": quotation.quotation_id,
                    "workflow_status": quotation.workflow_status,
                },
                status=201
            )

        #  Proper validation error (serializer / bad payload)
        except serializers.ValidationError as e:
            return Response(
                {
                    "statusCode": 400,
                    "status": False,
                    "message": "Validation error",
                    "error": e.detail,
                },
                status=400
            )

        #  Any unexpected server error
        except Exception as e:
            return Response(
                {
                    "statusCode": 500,
                    "status": False,
                    "message": "Failed to create quotation",
                    "error": str(e),
                },
                status=500
            )


           
class QuotationRequestDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    tags=["Quotation Request"],
    summary="Get quotation request details",
    description="Fetch quotation request details using UUID.",
    responses={
        200: OpenApiResponse(
            description="Quotation request fetched successfully"
        ),
        404: OpenApiResponse(
            description="Quotation request not found"
        ),
    }
    )

    def get(self,request,quotation_id):
        quta = get_object_or_404(
            QuotationRequest,
            quotation_id=quotation_id,
            isDeleted=False
        )
        serializer = QuotationRequestSerializer(quta)
        return Response({
            'statusCode':200,
            'status':True,
            'message':'Quotation Request info fetched successfully',
            'data':serializer.data
        },status=status.HTTP_200_OK)



class QuotationRequestExportPDFAPIView(APIView):
    permission_classes = [IsAuthenticated]
    @extend_schema(
    tags=["Quotation Request"],
    summary="Export quotation request as PDF",
    description="Generate and return a downloadable PDF URL for the quotation.",
    responses={
        200: OpenApiResponse(
            description="PDF generated successfully"
        ),
        404: OpenApiResponse(
            description="Quotation not found"
        ),
    }
    )

    def get(self, request, quotation_id):
        quotation = QuotationRequest.objects.filter(
            quotation_id=quotation_id,
            isDeleted=False
        ).first()

        if not quotation:
            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Quotation not found"
            }, status=404)

        pdf_url = generate_quotation_pdf(quotation, request)

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "PDF generated successfully",
            "pdf_url": request.build_absolute_uri(pdf_url)
        })
    

class QuotationRequestsListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            quotations = QuotationRequest.objects.filter(
                customupdatemodel__user=request.user,
                isDeleted=False
            )

            if not quotations.exists():
                return Response(
                    {   
                        "statusCode":200,
                        "status": True,
                        "message": "You have not submitted any quotation requests yet.",
                        "data": []
                    },
                    status=status.HTTP_200_OK
                )

            serializer = QuotationRequestSerializer(quotations, many=True)

            return Response(
                {   
                    "statusCode":200,
                    "status": True,
                    "message": "Your quotation requests fetched successfully.",
                    "total": quotations.count(),
                    "data": serializer.data
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {   "statusCode":500,
                    "status": False,
                    "message": "Something went wrong on server.",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


#------------------ CustomUpdate Model--------------------

class CustomUpdateModelsCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    tags=["CustomUpdate Model"],
    summary="Create custom update model",
    description=(
        "Create a new custom update model.\n\n"
        "• `json_data` can be a large JSON payload\n"
        "• Large JSON is stored as a file internally"
    ),
    request=CustomUpdateModelsSerializer,
    responses={
        201: OpenApiResponse(
            description="Custom update created successfully",
            response=CustomUpdateModelsSerializer
        ),
        500: OpenApiResponse(description="Server error"),
    },
    )
    def post(self, request):
        data = request.data.copy()

        # Large JSON nikaalo
        large_json = data.pop("json_data", None)
        json_path = None
        if large_json:
            json_path = save_large_json_to_file(large_json)

        # serializer = CustomUpdateModelsSerializer(data=data)
        serializer = CustomUpdateModelsSerializer(
            data=data,
            context={"request": request}
        )

        try:
            if serializer.is_valid(raise_exception=True):
                serializer.save(user=request.user, json_file_path=json_path)
                return Response({
                    "statusCode": 201,
                    "status": True,
                    "message": "Custom Update created successfully",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)

        except IntegrityError as e:
            # Check if it's a unique constraint error
            if "Duplicate entry" in str(e):
                return Response({
                    "statusCode": 400,
                    "status": False,
                    "message": "You have already created a Custom Update for this user and model_info.",
                    "error": str(e)
                }, status=status.HTTP_400_BAD_REQUEST)

        except serializers.ValidationError as e:
            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Invalid data provided.",
                "error": e.detail
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": "Something went wrong on server",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CustomUpdateModelsListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(

    tags=["CustomUpdate Model"],
    
    summary="List custom update models",
    description="Fetch all custom update models. Optional filter by IDs.",
    parameters=[
        OpenApiParameter(
            name="ids",
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            description="Comma-separated IDs (e.g. 1,2,3)",
            required=False
        )
    ],
    responses={
        200: OpenApiResponse(
            description="Custom updates fetched successfully",
            response=CustomUpdateModelsSerializer(many=True)
        )
    },
    )
    def get(self, request):
        qs = CustomUpdateModels.objects.filter(isDeleted=False)

        ids = request.GET.get("ids")
        if ids:
            id_list = [int(i.strip()) for i in ids.split(",")]
            qs = qs.filter(id__in=id_list)

        serializer = CustomUpdateModelsSerializer(qs, many=True,context={"request": request})
        return Response({
            "statusCode": 200,
            "status": True,
            "data": serializer.data
        })



class CustomUpdateModelsDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    tags=["CustomUpdate Model"],
    
    summary="Get custom update model detail",
    description="Fetch a single custom update model by ID",
    parameters=[
        OpenApiParameter(
            name="id",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description="Custom update model ID",
            required=True
        )
    ],
    responses={
        200: OpenApiResponse(
            description="Custom update fetched successfully",
            response=CustomUpdateModelsSerializer
        ),
        404: OpenApiResponse(description="Custom update not found"),
    },
    )
    def get(self, request, id):
        obj = get_object_or_404(CustomUpdateModels, id=id, isDeleted=False)
        serializer = CustomUpdateModelsSerializer(obj,context={"request": request})

        return Response({
            "statusCode": 200,
            "status": True,
            "data": serializer.data
        })


class CustomUpdateModelsUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    tags=["CustomUpdate Model"],
    summary="Update custom update model",
    description=(
        "Update custom update model fields.\n\n"
        "⚠ `json_data` updates are NOT allowed in this API."
    ),
    parameters=[
        OpenApiParameter(
            name="id",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description="Custom update model ID",
            required=True
        )
    ],
    request=CustomUpdateModelsSerializer,
    responses={
        200: OpenApiResponse(
            description="Updated successfully",
            response=CustomUpdateModelsSerializer
        ),
        400: OpenApiResponse(description="Validation error"),
        404: OpenApiResponse(description="Custom update not found"),
    },
    )
    def put(self, request, id):
        obj = get_object_or_404(CustomUpdateModels, id=id, isDeleted=False)

        data = request.data.copy()
        data.pop("json_data", None)  # block large json

        serializer = CustomUpdateModelsSerializer(
            obj,
            data=data,
            partial=True,
            context={"request": request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Updated successfully",
                "data": serializer.data
            })

        return Response(serializer.errors, status=400)


# class CustomUpdateModelsDeleteAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def delete(self, request, id):
#         obj = get_object_or_404(CustomUpdateModels, id=id)

#         # file bhi delete karo
#         if obj.json_file_path:
#             file_path = os.path.join(settings.MEDIA_ROOT, obj.json_file_path)
#             if os.path.exists(file_path):
#                 os.remove(file_path)

#         obj.delete()

#         return Response({
#             "statusCode": 204,
#             "status": True,
#             "message": "Deleted successfully"
#         }, status=status.HTTP_204_NO_CONTENT)


class CustomUpdateModelsDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]
    @extend_schema(
    tags=["CustomUpdate Model"],
    
    summary="Delete custom update models",
    description=(
        "Delete custom update models in two ways:\n\n"
        "• Delete ALL records → `{ \"all\": true }`\n"
        "• Delete specific records → `{ \"ids\": [1, 2, 3] }`\n\n"
        "Associated JSON files are also removed from storage."
    ),
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "ids": {
                    "type": "array",
                    "items": {"type": "integer"},
                    "description": "List of CustomUpdateModel IDs to delete"
                },
                "all": {
                    "type": "boolean",
                    "description": "Set true to delete all records"
                }
            },
            "example": {
                "ids": [1, 2, 3]
            }
        }
    },
    responses={
        204: OpenApiResponse(
            description="Records deleted successfully"
        ),
        400: OpenApiResponse(
            description="Invalid delete request"
        ),
        404: OpenApiResponse(
            description="No records found to delete"
        ),
    },
    )
    def delete(self, request):
        ids = request.data.get("ids", [])
        delete_all = request.data.get("all", False)

        # CASE 1: DELETE ALL
        if delete_all:
            queryset = CustomUpdateModels.objects.all()

            if not queryset.exists():
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "No records found to delete."
                }, status=status.HTTP_404_NOT_FOUND)

            for obj in queryset:
                if obj.json_file_path:
                    file_path = os.path.join(settings.MEDIA_ROOT, obj.json_file_path)
                    if os.path.exists(file_path):
                        os.remove(file_path)
                obj.delete()

            return Response({
                "status": True,
                "statusCode": 204,
                "message": "All records deleted successfully."
            }, status=status.HTTP_204_NO_CONTENT)

        # DELETE BY IDS
        if not ids or not isinstance(ids, list):
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Please provide a list of IDs in 'ids' field or set 'all=true'."
            }, status=status.HTTP_400_BAD_REQUEST)

        queryset = CustomUpdateModels.objects.filter(id__in=ids)

        if not queryset.exists():
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "No records found for given IDs."
            }, status=status.HTTP_404_NOT_FOUND)

        for obj in queryset:
            if obj.json_file_path:
                file_path = os.path.join(settings.MEDIA_ROOT, obj.json_file_path)
                if os.path.exists(file_path):
                    os.remove(file_path)
            obj.delete()

        return Response({
            "status": True,
            "statusCode": 204,
            "message": f"{queryset.count()} record(s) deleted successfully."
        }, status=status.HTTP_204_NO_CONTENT)

class CustomUpdateModelExportPDFAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    tags=["CustomUpdate Model"],
    summary="Export customization as PDF",
    description=(
        "Generate and export a PDF for a specific customization.\n\n"
        "The customization must belong to the authenticated user."
    ),
    parameters=[
        OpenApiParameter(
            name="customization_id",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description="Customization ID",
            required=True
        )
    ],
    responses={
        200: OpenApiResponse(
            description="PDF generated successfully",
            response={
                "type": "object",
                "properties": {
                    "statusCode": {"type": "integer", "example": 200},
                    "status": {"type": "boolean", "example": True},
                    "message": {"type": "string", "example": "PDF generated successfully"},
                    "pdf_url": {
                        "type": "string",
                        "example": "https://example.com/media/customizations/sample.pdf"
                    }
                }
            }
        ),
        404: OpenApiResponse(
            description="Customization not found",
            response={
                "type": "object",
                "properties": {
                    "statusCode": {"type": "integer", "example": 404},
                    "status": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Customization not found"}
                }
            }
        ),
    },
)
    def get(self, request, customization_id):
        customization = CustomUpdateModels.objects.filter(
            id=customization_id,
            user=request.user,
            isDeleted=False
        ).first()
        print("REQUEST USER:", request.user)

        if not customization:
            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Customization not found"
            }, status=404)

        pdf_path = generate_customization_pdf(customization, request.user)
        pdf_url = request.build_absolute_uri(pdf_path)
        return Response({
            "StatusCode":200,
            "status":True,
            "message":"export pdf successfully. ",
            "pdf_url":pdf_url
        },status=status.HTTP_200_OK)
# class CustomModelsUserAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         queryset = CustomUpdateModels.objects.filter(
#             user__id=request.user.id,
#             isDeleted=False
#         )

#         serializer = CustomUpdateModelsSerializer(
#             queryset, many=True, context={"request": request}
#         )

#         return Response({
#             "statusCode": 200,
#             "status": True,
#             "user_id": request.user.id,
#             "data": serializer.data
#         })

class CustomModelsUserAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user

        category_slug = request.GET.get("category")   
        sort = request.GET.get("sort", "new")        
        range_days = request.GET.get("range")         

        queryset = CustomUpdateModels.objects.filter(
            user=user,
            isDeleted=False
        )

        #  Category / Industry Filter
        if category_slug:
            queryset = queryset.filter(
                model_info__product__category__slug=category_slug
            )

        # Date Range Filter
        if range_days:
            try:
                days = int(range_days)
                start_date = now() - timedelta(days=days)
                queryset = queryset.filter(created_at__gte=start_date)
            except:
                pass

        # Sorting
        if sort == "old":
            queryset = queryset.order_by("created_at")
        else:
            queryset = queryset.order_by("-created_at")

        serializer = CustomUpdateModelsSerializer(
            queryset, many=True, context={"request": request}
        )

        return Response({
            "statusCode": 200,
            "status": True,
            "user_id": user.id,
            "message":"fetch data successfully ",
            "data": serializer.data
        },status=status.HTTP_200_OK)

class OrderHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        filter_type = request.GET.get("type", "all")  # all, drafted, submitted

        data = []

        # Drafted Orders
        if filter_type in ["all", "drafted"]:
            drafts = CustomUpdateModels.objects.filter(
                user=user,
                isActive=True,
                isDeleted=False
            ).order_by("-created_at")

            for d in drafts:
                data.append({
                    "id": d.id,
                    "order_no": f"FORM-{d.id}",
                    "title": "Custom Design",
                    "status": "Drafted",
                    "date": d.created_at,
                    "type": "drafted"
                })

        # Submitted Orders
        if filter_type in ["all", "submitted"]:
            quotes = QuotationRequest.objects.filter(
                customupdatemodel__user=user,
                isActive=True,
                isDeleted=False
            ).order_by("-created_at")

            for q in quotes:
                data.append({
                    "id": str(q.uuids),
                    "order_no": q.quotation_id,
                    "title": q.item_type or "Quotation Request",
                    "status": q.quotation_status.capitalize(),
                    "date": q.created_at,
                    "type": "submitted"
                })

        # Sort latest first
        data = sorted(data, key=lambda x: x["date"], reverse=True)

        return Response({
            "status": True,
            "filter": filter_type,
            "data": data
        })
