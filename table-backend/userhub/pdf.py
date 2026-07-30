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

class QuotationDetailView(APIView):
    """
    GET /api/quotations/<uuid:pk>/
    Returns summary JSON (for the right panel) + a pdf_url (for the left viewer).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        quotation = QuotationRequest.objects.filter(
            uuids=pk, isDeleted=False
        ).select_related('customupdatemodel__model_info__product').first()
        if not quotation:
            return Response({"detail": "Not found"}, status=404)

        data = QuotationSummarySerializer(quotation).data
        pdf_path = reverse('quotation-pdf', kwargs={'pk': quotation.uuids})
        data['pdf_url'] = request.build_absolute_uri(pdf_path)

        return Response(data, status=200)
    
    


class QuotationPDFView(APIView):
    """GET /api/quotations/<uuid:pk>/pdf/"""
    permission_classes = [IsAuthenticated]

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
    