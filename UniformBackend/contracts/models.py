
#contracts/models.py
from django.db import models

# Create your models here.
from django.db import models
from userhub.models import QuotationRequest

class DocuSignEnvelope(models.Model):
    STATUS_CHOICES = (
        ("created", "Created"),
        ("sent", "Sent"),
        ("delivered", "Delivered"),
        ("completed", "Completed"),
        ("declined", "Declined"),
        ("voided", "Voided"),
    )


    AGREEMENT_STATUS = (
        ("draft", "Draft"),
        ("sent_to_client", "Sent to Client"),
        ("viewed", "Viewed by Client"),
        ("client_signed", "Client Signed"),
        ("admin_pending", "Waiting Admin"),
        ("admin_approved", "Admin Approved"),
        ("final_sent", "Final Agreement Sent"),
    )

    quotation_request = models.ForeignKey(
        QuotationRequest,
        on_delete=models.CASCADE,
        related_name="docusign_envelope"
    )

    envelope_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)    
    agreement_status = models.CharField(max_length=30,choices=AGREEMENT_STATUS,default="draft")    
    client_signed_at = models.DateTimeField(null=True, blank=True)
    admin_approved_at = models.DateTimeField(null=True, blank=True)
    final_sent_at = models.DateTimeField(null=True, blank=True)    
    signed_pdf = models.FileField(upload_to="signed_contracts/", null=True, blank=True)
    audit_log = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Envelope {self.envelope_id} ({self.status})"



