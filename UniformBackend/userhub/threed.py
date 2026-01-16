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
from uniformAdmin.models import QuotationTemplate
from rest_framework.permissions import IsAuthenticated ,BasePermission,AllowAny
from contracts.utils import *
from userhub.utils import generate_quotation_pdf
#<-------------------ModelsInfo------------------->
class ModelInfoCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request):
        try:
            serializer = ModelInfoSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            model_info = serializer.save()
            return Response({
                'statusCode' : 201,
                'status':True,
                "message": "3D model information created successfully",
                "data": ModelInfoSerializer(model_info).data
            },status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'statusCode':500,
                'status':False,
                "message": "Something went wrong on server",
                "details": str(e)
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
class ModelInfoListAPIView(APIView):
    parser_classes = [IsAuthenticated]
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
class CustomUpdateModelExportPDFAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, customization_id):
        customization = CustomUpdateModels.objects.filter(
            id=customization_id,
            user=request.user,
            isDeleted=False
        ).first()

        if not customization:
            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Customization not found"
            }, status=404)

        pdf_url = generate_customization_pdf(customization, request.user)

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "PDF generated successfully",
            "pdf_url": request.build_absolute_uri(pdf_url)
        })


#<----------------------QuotationRequest------------------>
           
           
# class QuotationRequestCreateAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         try:
#             template_slug = request.data.get("template_slug")

#             if not template_slug:
#                 return Response(
#                     {"message": "template_slug is required"},
#                     status=400
#                 )

#             # Fetch template
#             template = QuotationTemplate.objects.filter(
#                 slug=template_slug,
#                 is_active=True,
#                 is_deleted=False
#             ).first()

#             if not template:
#                 return Response(
#                     {"message": "Template not found"},
#                     status=404
#                 )

#             serializer = QuotationRequestSerializer(data=request.data)
#             serializer.is_valid(raise_exception=True)

#             # Save quotation with template
#             quotation = serializer.save(template=template)

#             create_admin_notification(
#                 instance=quotation,
#                 title=f"New Quotation Request: {quotation.quotation_id}",
#                 message=f"A new quotation request has been created by {quotation.company_name}.",
#                 priority="high"
#             )

#             return Response({
#                 "statusCode": 201,
#                 "status": True,
#                 "message": "Quotation Request created successfully",
#                 "quotation_id": quotation.quotation_id,
#                 "template": template.slug
#             }, status=201)

#         except Exception as e:
#             return Response({
#                 "statusCode": 500,
#                 "status": False,
#                 "message": "Something went wrong on server",
#                 "error": str(e)
#             }, status=500)
          
          


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import pdfkit
import os

from uniformAdmin.models import QuotationTemplate
from userhub.serializers import QuotationRequestSerializer
# from contracts.docusign_client import send_quotation_for_signature
from contracts.models import DocuSignEnvelope
from uniformAdmin.utils import render_quotation_template
from uniformAdmin.utils import create_admin_notification





from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
import pdfkit

from userhub.models import QuotationRequest
from uniformAdmin.models import QuotationTemplate
from contracts.models import DocuSignEnvelope

from uniformAdmin.utils import render_quotation_template



class QuotationRequestCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            template_slug = request.data.get("template_slug")
            if not template_slug:
                return Response({"message": "template_slug is required"}, status=400)

            template = QuotationTemplate.objects.filter(
                slug=template_slug,
                is_active=True,
                is_deleted=False
            ).first()

            if not template:
                return Response({"message": "Template not found"}, status=404)

            serializer = QuotationRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            quotation = serializer.save(
                template=template,
                workflow_status="REQUESTED",
                quotation_status="pending"
            )

            # 🚀 CREATE DOCUSIGN & SEND EMAIL IMMEDIATELY
            envelope_id = send_docusign_envelope(quotation)

            DocuSignEnvelope.objects.create(
                quotation_request=quotation,
                envelope_id=envelope_id,
                status="sent",
                agreement_status="sent_to_client"
            )

            quotation.workflow_status = "SENT"
            quotation.save()

            return Response({
                "status": True,
                "message": "Quotation created and DocuSign sent",
                "quotation_id": quotation.quotation_id,
                "workflow_status": quotation.workflow_status
            }, status=201)

        except Exception as e:
            return Response({
                "status": False,
                "message": "Failed to create quotation",
                "error": str(e)
            }, status=500)


           
           
class QuotationRequestDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request,uuid):
        quta = get_object_or_404(
            QuotationRequest,
            uuids=uuid,
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

    def get(self, request, uuid):
        quotation = QuotationRequest.objects.filter(
            uuids=uuid,
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

class CustomUpdateModelsCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            data = request.data.copy()

            # large json nikaalo
            large_json = data.pop("json_data", None)

            json_path = None
            if large_json:
                json_path = save_large_json_to_file(large_json)

            serializer = CustomUpdateModelsSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save(
                user=request.user,
                json_file_path=json_path
            )

            return Response({
                "statusCode": 201,
                "status": True,
                "message": "Custom Update created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": "Something went wrong on server",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class CustomUpdateModelsListAPIView(APIView):
    permission_classes = [IsAuthenticated]

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

    def put(self, request, id):
        obj = get_object_or_404(CustomUpdateModels, id=id, isDeleted=False)

        data = request.data.copy()
        data.pop("json_data", None)  # block large json

        serializer = CustomUpdateModelsSerializer(
            obj,
            data=data,
            partial=True
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
