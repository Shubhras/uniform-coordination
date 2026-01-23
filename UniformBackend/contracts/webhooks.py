# contracts/webhook.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from contracts.models import DocuSignEnvelope
import json
@csrf_exempt
@api_view(["POST"])
def docusign_webhook(request):
    payload = request.data

    print("DOCUSIGN PAYLOAD:", json.dumps(payload, indent=2))

    event = payload.get("event")
    data = payload.get("data", {})
    envelope_id = data.get("envelopeId")

    if not envelope_id or not event:
        return Response({"error": "Invalid DocuSign payload"}, status=400)

    env = DocuSignEnvelope.objects.filter(envelope_id=envelope_id).first()
    if not env:
        return Response({"error": "Envelope not found"}, status=200)  # DocuSign retries otherwise

    quotation = env.quotation_request

    if event == "envelope-sent":
        env.status = "sent"
        env.agreement_status = "sent_to_client"
        quotation.workflow_status = "SENT"

    
    elif event == "envelope-delivered":
        env.status = "delivered"
        env.agreement_status = "viewed"
        quotation.workflow_status = "SENT"


    elif event == "envelope-completed":
        env.status = "completed"
        env.agreement_status = "client_signed"
        env.client_signed_at = timezone.now()

        # THIS IS THE KEY
        quotation.workflow_status = "SIGNED"

    elif event == "envelope-declined":
        env.status = "declined"
        quotation.workflow_status = "REQUESTED"

    env.audit_log = payload
    env.save()
    quotation.save()

    return Response({"ok": True})
