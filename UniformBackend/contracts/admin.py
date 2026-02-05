# from django.contrib import admin
# # Register your models here.
# from django.contrib import admin
# from .models import DocuSignEnvelope

# @admin.register(DocuSignEnvelope)
# class DocuSignEnvelopeAdmin(admin.ModelAdmin):

#     list_display = ("envelope_id","get_company","get_client","status","agreement_status","client_signed_at","admin_approved_at","final_sent_at","created_at",)

#     list_filter = ("status","agreement_status","created_at",)

#     search_fields = ("envelope_id","quotation_request__company_name","quotation_request__contact_person","quotation_request__email",)

#     readonly_fields = ("envelope_id","status","agreement_status","client_signed_at","final_sent_at","created_at","updated_at","audit_log",)

#     ordering = ("-created_at",)

#     fieldsets = (
#         ("Quotation", {
#             "fields": (
#                 "quotation_request",
#                 "envelope_id",
#             )
#         }),
#         ("DocuSign Status", {
#             "fields": (
#                 "status",
#                 "agreement_status",
#             )
#         }),
#         ("Timeline", {
#             "fields": (
#                 "client_signed_at",
#                 "admin_approved_at",
#                 "final_sent_at",
#                 "created_at",
#                 "updated_at",
#             )
#         }),
#         ("Signed Document", {
#             "fields": ("signed_pdf",)
#         }),
#         ("Audit Trail (DocuSign Webhook)", {
#             "fields": ("audit_log",),
#             "classes": ("collapse",)
#         }),
#     )

#     def get_company(self, obj):
#         return obj.quotation_request.company_name
#     get_company.short_description = "Company"

#     def get_client(self, obj):
#         return obj.quotation_request.contact_person
#     get_client.short_description = "Client"


#-----------------------------------------
from django.contrib import admin
from .models import DocuSignEnvelope

@admin.register(DocuSignEnvelope)
class DocuSignEnvelopeAdmin(admin.ModelAdmin):

    list_display = (
        "envelope_id",
        "get_company_or_order",
        "get_client_or_recipient",
        "status",
        "agreement_status",
        "client_signed_at",
        "admin_approved_at",
        "final_sent_at",
        "created_at",
        
    )

    list_filter = ("status", "agreement_status", "created_at",)

    search_fields = (
        "envelope_id",
        "quotation_request__company_name",
        "quotation_request__contact_person",
        "quotation_request__email",
        "order_id",
    )

    readonly_fields = (
        "envelope_id",
        "status",
        "agreement_status",
        "client_signed_at",
        "final_sent_at",
        "created_at",
        "updated_at",
        "audit_log",
    )

    ordering = ("-created_at",)

    fieldsets = (
        ("Quotation / Rental", {
            "fields": (
                "quotation_request",
                "order_id",
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

    # ---------------------------
    # Safe method for Company / Order
    # ---------------------------
    def get_company_or_order(self, obj):
        if obj.quotation_request:
            return obj.quotation_request.company_name
        if obj.order_id:
            return f"Rental Order: {obj.order_id}"
        return "N/A"
    get_company_or_order.short_description = "Company / Order"

    # ---------------------------
    # Safe method for Client / Recipient
    # ---------------------------
    def get_client_or_recipient(self, obj):
        # Quotation flow
        if obj.quotation_request:
            return obj.quotation_request.contact_person

        # Rental flow - check audit_log
        try:
            signers = obj.audit_log.get("data", {}).get("recipients", {}).get("signers", [])
            if signers:
                return signers[0].get("name") or signers[0].get("email")
        except Exception:
            pass

        return "N/A"
    get_client_or_recipient.short_description = "Client / Recipient"
