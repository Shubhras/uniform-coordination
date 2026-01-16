from django.contrib import admin
# Register your models here.
from django.contrib import admin
from .models import DocuSignEnvelope


@admin.register(DocuSignEnvelope)
class DocuSignEnvelopeAdmin(admin.ModelAdmin):

    list_display = ("envelope_id","get_company","get_client","status","agreement_status","client_signed_at","admin_approved_at","final_sent_at","created_at",)

    list_filter = ("status","agreement_status","created_at",)

    search_fields = ("envelope_id","quotation_request__company_name","quotation_request__contact_person","quotation_request__email",)

    readonly_fields = ("envelope_id","status","agreement_status","client_signed_at","final_sent_at","created_at","updated_at","audit_log",)

    ordering = ("-created_at",)

    fieldsets = (
        ("Quotation", {
            "fields": (
                "quotation_request",
                "envelope_id",
            )
        }),
        ("DocuSign Status", {
            "fields": (
                "status",
                "agreement_status",
            )
        }),
        ("Timeline", {
            "fields": (
                "client_signed_at",
                "admin_approved_at",
                "final_sent_at",
                "created_at",
                "updated_at",
            )
        }),
        ("Signed Document", {
            "fields": ("signed_pdf",)
        }),
        ("Audit Trail (DocuSign Webhook)", {
            "fields": ("audit_log",),
            "classes": ("collapse",)
        }),
    )

    def get_company(self, obj):
        return obj.quotation_request.company_name
    get_company.short_description = "Company"

    def get_client(self, obj):
        return obj.quotation_request.contact_person
    get_client.short_description = "Client"
