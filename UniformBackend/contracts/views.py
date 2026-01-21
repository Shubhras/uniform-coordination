#contracts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from userhub.models import QuotationRequest  
from contracts.models import DocuSignEnvelope
from contracts.utils import send_final_pdf_to_user
from drf_spectacular.utils import extend_schema,OpenApiExample,OpenApiResponse,OpenApiParameter,OpenApiTypes



class QuotationSendAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    tags=["Quotation · Admin"],
    summary="Send final signed quotation to client",
    description=(
        "Sends the final signed quotation PDF to the client **after**:\n"
        "- Quotation exists\n"
        "- DocuSign envelope exists\n"
        "- Client has signed the agreement\n\n"
        "**Effects:**\n"
        "- Sends final PDF to client\n"
        "- Updates DocuSign envelope status\n"
        "- Marks quotation workflow as COMPLETED"
    ),
    request={
        "application/json": {
            "type": "object",
            "required": ["quotation_id"],
            "properties": {
                "quotation_id": {
                    "type": "string",
                    "example": "QUO-2024-001"
                }
            }
        }
    },
    responses={
        200: OpenApiResponse(
            description="Final agreement sent successfully",
            response={
                "type": "object",
                "properties": {
                    "status": {"type": "boolean", "example": True},
                    "message": {"type": "string", "example": "Final agreement sent to client"},
                    "quotation_id": {"type": "string", "example": "QUO-2024-001"},
                    "workflow_status": {"type": "string", "example": "COMPLETED"},
                }
            }
        ),
        400: OpenApiResponse(description="Validation or workflow error"),
        404: OpenApiResponse(description="Quotation not found"),
        401: OpenApiResponse(description="Authentication required"),
    },
    examples=[
        OpenApiExample(
            name="Send Final Agreement",
            value={
                "quotation_id": "QUO-2024-001"
            },
            request_only=True
        )
    ]
)
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
