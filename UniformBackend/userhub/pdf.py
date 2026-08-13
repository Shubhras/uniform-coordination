from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.reverse import reverse
from .models import QuotationRequest
from .serializers import QuotationSummarySerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse
from django.template.loader import render_to_string
from weasyprint import HTML
import io
import base64
import os
from django.conf import settings
from rest_framework.permissions import AllowAny


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
        quotation = QuotationRequest.objects.filter(
            uuids=pk, isDeleted=False
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
    """GET /api/v1/userhub/quotations/<uuid:pk>/pdf/"""
    # permission_classes = [IsAuthenticated]
    permission_classes = [AllowAny]

    def get(self, request, pk):
        quotation = QuotationRequest.objects.filter(
            uuids=pk, isDeleted=False
        ).select_related('customupdatemodel__model_info__product').first()
        if not quotation:
            return Response({"detail": "Not found"}, status=404)

        data = QuotationSummarySerializer(quotation).data
        html_string = render_to_string("quotations/quote_pdf.html", {
            "quotation": quotation,
            "items": data["line_items"],
            "total_amount": data["total_amount"],
            "logo_data_uri": _get_logo_data_uri(),
        })

        pdf_file = io.BytesIO()
        HTML(string=html_string).write_pdf(pdf_file)
        pdf_file.seek(0)

        return FileResponse(
            pdf_file,
            as_attachment=False,  # True forces download instead of inline view
            filename=f"Uniform_Quote_{quotation.quotation_id}.pdf",
            content_type='application/pdf',
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

