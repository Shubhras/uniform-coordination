

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from userhub.models import QuotationRequest  
from contracts.models import DocuSignEnvelope
from contracts.utils import send_final_pdf_to_user



class QuotationSendAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        quotation_id = request.data.get("quotation_id")

        if not quotation_id:
            return Response({"message": "quotation_id is required"}, status=400)

        quotation = QuotationRequest.objects.filter(
            quotation_id=quotation_id,
            isDeleted=False
        ).first()

        if not quotation:
            return Response({"message": "Quotation not found"}, status=404)

        env = quotation.docusign_envelope.first()

        if not env:
            return Response({"message": "No DocuSign envelope found"}, status=400)

        if env.agreement_status != "client_signed":
            return Response({"message": "Client has not signed yet"}, status=400)

        # Send final signed PDF
        send_final_pdf_to_user(env)

        env.agreement_status = "final_sent"
        env.admin_approved_at = timezone.now()
        env.final_sent_at = timezone.now()
        env.save()

        quotation.workflow_status = "COMPLETED"
        quotation.save()

        return Response({
            "status": True,
            "message": "Final agreement sent to client",
            "quotation_id": quotation.quotation_id,
            "workflow_status": quotation.workflow_status
        })
