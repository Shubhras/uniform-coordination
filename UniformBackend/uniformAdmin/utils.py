from userhub.models import QuotationRequest
from .models import AdminNotification
from django.contrib.contenttypes.models import ContentType
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import re


def render_quotation_template(template_text: str, quotation: QuotationRequest):
    if not template_text or not quotation:
        return template_text

    data = {
        "{QUOTATION_ID}": quotation.quotation_id or "",
        "{DATE}": quotation.created_at.strftime("%d-%m-%Y") if quotation.created_at else "",
        "{DELIVERY_DATE}": quotation.delivery_date.strftime("%d-%m-%Y") if quotation.delivery_date else "",
        "{CLIENT_NAME}": quotation.company_name or "",
        "{ITEM_TYPE}": quotation.item_type or "",
        "{MATERIAL}": quotation.material or "",
        "{SIZE_QUANTITY}": quotation.size_quantity or "",
        "{NOTE}": quotation.additional_note or "",
        "{STATUS}": quotation.quotation_status.upper() if quotation.quotation_status else "",
    }

    for key, value in data.items():
        template_text = template_text.replace(key, str(value))

    # Detect unresolved placeholders
    # unresolved = re.findall(r"\{[A-Z_]+\}", template_text)
    # if unresolved:
    #     raise Exception(f"Unresolved placeholders in template: {unresolved}")


    return template_text


def create_admin_notification(instance, title, message, priority="low"):
    content_type = ContentType.objects.get_for_model(instance)

    AdminNotification.objects.create(
        content_type=content_type,
        object_id=str(instance.pk),
        title=title,
        message=message,
        priority=priority,
    )


#<===============B2B=================>
def get_default_b2b_role():
    from .models import Role
    role, _ = Role.objects.get_or_create(
        role_name="b2b_user",
        defaults={
            "slug": "b2b-user",
            "description": "Default B2B User"
        }
    )
    return role

#<============Email id function===========>

def send_reset_email(subject, message, recipient_email):
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [recipient_email],
        fail_silently=False,
    )



class BaseAPIView(APIView):
    """
    Common response handler for all APIs
    """
 
    def success_response(self, message, data=None):
        return Response(
            {
                "status": True,
                "statusCode": 200,
                "message": message,
                "data": data,
            },
            status=status.HTTP_200_OK,
        )
 
 
    def error_response(self, message):
        # Handle serializer validation errors
        if isinstance(message, dict):
            first_error = next(iter(message.values()))
            if isinstance(first_error, list):
                message = f"Validation Failed; {first_error[0]}"
 
            else:
                message = f"Validation Failed; {first_error}"
 
        return Response(
            {
                "status": False,
                "statusCode": 200,
                "message": message,
            },
            status=status.HTTP_200_OK,
        )
 