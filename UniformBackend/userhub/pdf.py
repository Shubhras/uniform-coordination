from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.reverse import reverse
from .models import QuotationRequest
from .serializers import QuotationSummarySerializer
from django.http import FileResponse
from django.template.loader import render_to_string
from django.db.models import Q
import uuid
from weasyprint import HTML
import io
import base64
import os
from django.conf import settings


def _get_logo_data_uri():
    logo_path = os.path.join(settings.BASE_DIR, "userhub", "static", "userhub", "img", "logo.png")
    try:
        with open(logo_path, "rb") as logo_file:
            encoded = base64.b64encode(logo_file.read()).decode("ascii")
        return f"data:image/png;base64,{encoded}"
    except FileNotFoundError:
        return ""


class QuotationDetailView(APIView):
    """
    GET /api/quotations/<uuid:pk>/
    Returns summary JSON (for the right panel) + a pdf_url (for the left viewer).
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        lookup = Q(quotation_id=pk)
        try:
            uuid.UUID(str(pk))
            lookup |= Q(uuids=pk)
        except (ValueError, TypeError):
            pass

        quotation = QuotationRequest.objects.filter(
            lookup, isDeleted=False
        ).select_related('customupdatemodel__model_info__product').first()

        if not quotation:
            return Response(
                {
                    "success": False,
                    "status_code": 404,
                    "message": "Quotation not found",
                    "data": None,
                },
                status=404,
            )

        data = QuotationSummarySerializer(quotation).data
        pdf_path = reverse('quotation-pdf', kwargs={'pk': quotation.uuids})
        data['pdf_url'] = request.build_absolute_uri(pdf_path)

        return Response(
            {
                "success": True,
                "status_code": 200,
                "message": "Quotation fetched successfully",
                "data": data,
            },
            status=200,
        )    


class QuotationPDFView(APIView):
    """GET /api/v1/userhub/quotations/<str:pk>/pdf/"""
    permission_classes = [AllowAny]

    def get(self, request, pk):
        lookup = Q(quotation_id=pk)
        try:
            uuid.UUID(str(pk))
            lookup |= Q(uuids=pk)
        except (ValueError, TypeError):
            pass

        quotation = QuotationRequest.objects.filter(
            lookup, isDeleted=False
        ).select_related('customupdatemodel__model_info__product').first()
        if not quotation:
            return Response({"detail": "Not found"}, status=404)

        download_param = request.GET.get('download', '').lower()
        as_attachment = download_param in ('1', 'true', 'yes')

        filename = f"Uniform_Quote_{quotation.quotation_id or quotation.uuids or 'Document'}.pdf"

        try:
            data = QuotationSummarySerializer(quotation).data
            html_string = render_to_string("quotations/quote_pdf.html", {
                "quotation": quotation,
                "items": data.get("line_items", []),
                "total_amount": data.get("total_amount", 0),
                "logo_data_uri": _get_logo_data_uri(),
            })

            pdf_file = io.BytesIO()
            HTML(string=html_string).write_pdf(pdf_file)
            pdf_file.seek(0)

            return FileResponse(
                pdf_file,
                as_attachment=as_attachment,
                filename=filename,
                content_type='application/pdf',
            )
        except Exception as e:
            # Fallback to generate_quotation_pdf (ReportLab) if Weasyprint encounters an issue
            try:
                from .utils import generate_quotation_pdf
                file_path = generate_quotation_pdf(quotation, request)
                if file_path and os.path.exists(file_path):
                    return FileResponse(
                        open(file_path, 'rb'),
                        as_attachment=as_attachment,
                        filename=filename,
                        content_type='application/pdf',
                    )
            except Exception as fallback_err:
                pass

            return Response(
                {"detail": f"Failed to generate PDF: {str(e)}"},
                status=500
            )    
  
  
# # from django.core.files.base import ContentFile

# # class QuotationPDFView(APIView):
#     authentication_classes = []
#     permission_classes = [AllowAny]

#     def get(self, request, pk):
#         quotation = QuotationRequest.objects.filter(
#             uuids=pk, isDeleted=False
#         ).select_related('customupdatemodel__model_info__product').first()
#         if not quotation:
#             return Response({"detail": "Not found"}, status=404)

#         # Serve cached file if it already exists
#         if quotation.quotation_pdf:
#             return FileResponse(
#                 quotation.quotation_pdf.open('rb'),
#                 as_attachment=False,
#                 filename=f"Uniform_Quote_{quotation.quotation_id}.pdf",
#                 content_type='application/pdf',
#             )

#         # Otherwise generate once and cache it
#         data = QuotationSummarySerializer(quotation).data
#         # html_string = render_to_string("quotations/quote_pdf.html", {
#         #     "quotation": quotation,
#         #     "items": data["line_items"],
#         #     "total_amount": data["total_amount"],
#         # })
#         html_string = render_to_string("quotations/quote_pdf.html", {
#             "quotation": quotation,
#             "items": data["line_items"],
#             "total_amount": data["total_amount"],
#         })
#         pdf_bytes = HTML(string=html_string).write_pdf()

#         quotation.quotation_pdf.save(
#             f"{quotation.quotation_id}.pdf",
#             ContentFile(pdf_bytes),
#             save=True,
#         )

#         return FileResponse(
#             io.BytesIO(pdf_bytes),
#             as_attachment=False,
#             filename=f"Uniform_Quote_{quotation.quotation_id}.pdf",
#             content_type='application/pdf',
#         )    

