from userhub.models import *
from .models import AdminNotification
from django.contrib.contenttypes.models import ContentType
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os, re
from reportlab.platypus import *
from reportlab.lib.styles import *
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.enums import TA_RIGHT
from datetime import datetime
from userhub.utils import RoundedKFBox
from reportlab.platypus import TableStyle

def render_quotation_template(template_text: str, quotation):
    if not template_text or not quotation:
        return template_text

    product = None
    try:
        if quotation.customupdatemodel and quotation.customupdatemodel.model_info:
            product = quotation.customupdatemodel.model_info.product
    except Exception as e:
        print("Error fetching product:", e)
        product = None

    price = float(getattr(product, "price", 0)) if product else 0
    discount = float(getattr(product, "discount", 0)) if product else 0
    quantity = 0
    if getattr(quotation, "size_quantity", None):
        numbers = re.findall(r"\d+", quotation.size_quantity)
        quantity = sum(int(n) for n in numbers)

    subtotal = quantity * price
    discount_amount = (subtotal * discount) / 100
    total = subtotal - discount_amount

    data = {
        "quotation_id": getattr(quotation, "quotation_id", "") or "",
        "contact_person": getattr(quotation, "contact_person", "") or "",
        "company_name": getattr(quotation, "company_name", "") or "",
        "item_type": getattr(quotation, "item_type", "") or "",
        "material": getattr(quotation, "material", "") or "",
        "size_quantity": getattr(quotation, "size_quantity", "") or "",
        "delivery_date": quotation.delivery_date.strftime("%d-%m-%Y") if getattr(quotation, "delivery_date", None) else "",
        "additional_note": getattr(quotation, "additional_note", "") or "",

        "quantity": quantity,
        "unit_price": round(price, 2),
        "subtotal": round(subtotal, 2),
        "discount": discount,
        "total": round(total, 2),
    }

    try:
        return template_text.format(**data)
    except KeyError as e:
        return f"Template error: Missing field {str(e)}"


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

def generate_quotation_template_pdf(quotation, template_text):
    # ---------- RENDER DATA ----------
    render_quotation_template(template_text, quotation)

    product = quotation.customupdatemodel.model_info.product
    price = float(product.price)
    discount = float(product.discount)

    qty = sum(int(x) for x in __import__("re").findall(r"\d+", quotation.size_quantity))
    subtotal = qty * price
    discount_amt = subtotal * discount / 100
    total = subtotal - discount_amt

    # ---------- FILE ----------
    file_name = f"quotation_{quotation.quotation_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
    file_path = os.path.join(settings.MEDIA_ROOT, "exports", file_name)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    doc = SimpleDocTemplate(file_path, pagesize=A4,
                            leftMargin=40, rightMargin=40,
                            topMargin=40, bottomMargin=40)

    styles = getSampleStyleSheet()
    elements = []

    # ---------- STYLES ----------
    normal = ParagraphStyle("Normal", fontSize=11, leading=18)
    bold = ParagraphStyle("Bold", fontSize=11, leading=18, fontName="Helvetica-Bold")

    right = ParagraphStyle("Right", alignment=TA_RIGHT, fontSize=10)

    title = ParagraphStyle("Title", fontSize=16, fontName="Helvetica-Bold")
 # --- LOGO STYLES ---
    logo_text_style = ParagraphStyle(
        "LogoText",
        fontSize=14,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#0B3C5D"),
        leading=16
    )
    logo_tagline_style = ParagraphStyle(
        "LogoTagline",
        fontSize=9,
        textColor=colors.HexColor("#0B3C5D"),
        leading=2
    )
 
    # ---LOGO ---
    left_logo_block = Table(
        [
            [RoundedKFBox()],
            [Paragraph("Cleanliness and Trust.", logo_tagline_style)],
        ],
        colWidths=[100]
    )
    left_logo_block.setStyle(TableStyle([
        ("ALIGN", (0, 1), (0, 1), "CENTER"),
        ("TOPPADDING", (0, 1), (0, 1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
 
    right_logo_text = Table(
        [
            [Spacer(1, 8)],
            [Paragraph("KIREIZ", logo_text_style)],
            [Paragraph("FORM", logo_text_style)],
        ],
        colWidths=[140]
    )
    right_logo_text.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
 
    logo_table = Table(
        [
            [left_logo_block, right_logo_text],
        ],
        colWidths=[55, 440]
    )
    logo_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
 
    elements.append(logo_table)
    elements.append(Spacer(1, 20))
 

    # ---------- QUOTE INFO ----------
    elements.append(Paragraph(f"<b>QUOTATION #{quotation.quotation_id}</b>", title))
    elements.append(Spacer(1, 10))

    today = datetime.now().strftime("%d/%m/%Y")
    valid = quotation.delivery_date.strftime("%d/%m/%Y")

    elements.append(Paragraph(f"<b>Date:</b> {today}", normal))
    elements.append(Paragraph(f"<b>Valid until:</b> {valid}", normal))

    elements.append(Spacer(1, 20))

    # ---------- BODY ----------
    elements.append(Paragraph(f"Dear {quotation.contact_person},", normal))
    elements.append(Spacer(1, 10))

    elements.append(Paragraph(
        "Thank you for your interest in our products. Based on your requirements, we are pleased to offer the following quotation:",
        normal
    ))

    elements.append(Spacer(1, 20))

    # ---------- PRODUCT ----------
    elements.append(Paragraph(f"<b>Item:</b> {quotation.item_type}", normal))
    elements.append(Paragraph(f"<b>Material:</b> {quotation.material}", normal))
    elements.append(Paragraph(f"<b>Quantity:</b> {qty} meters", normal))
    elements.append(Paragraph(f"<b>Unit Price:</b>  {price}", normal))

    elements.append(Spacer(1, 10))

    # Divider
    elements.append(Paragraph("_________________________________________", normal))

    elements.append(Paragraph(f"<b>Subtotal:</b> {subtotal}", normal))
    elements.append(Paragraph(f"<b>Discount:</b> {discount} %", normal))

    elements.append(Paragraph("_________________________________________", normal))

    elements.append(Spacer(1, 10))

    elements.append(Paragraph(f"<b>TOTAL:  {round(total,2)}</b>", bold))

    elements.append(Spacer(1, 20))

    # ---------- TERMS ----------
    elements.append(Paragraph("<b>Terms & Conditions:</b>", bold))
    elements.append(Paragraph("1. 50% advance payment required.", normal))
    elements.append(Paragraph("2. Delivery within 14 days of confirmation.", normal))

    elements.append(Spacer(1, 30))

    # ---------- FOOTER ----------
    elements.append(Paragraph("Sincerely,", normal))
    elements.append(Paragraph("Sales Team", normal))

    # ---------- BUILD ----------
    doc.build(elements)

    return f"{settings.MEDIA_URL}exports/{file_name}"

def send_b2b_welcome_email(user, raw_password):
    subject = "Welcome to Our B2B Portal 🎉"

    def row(label, value):
        return f"{label:<15} : {value}"

    message = f"""
                    WELCOME B2B USER

        Hello {user.name},

        Your B2B account has been successfully created.

        {row("Name", user.name)}
        {row("Company", user.company_name)}
        {row("Email", user.email)}
        {row("Mobile", user.mobile)}
        {row("Tier", user.tier)}
        {row("Password", raw_password)}

        Please login and change your password after first login.

        """

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [user.email],  
        fail_silently=False,
    )
    
# for server
def new_build_media_url(file_field):
    """
    Returns an absolute URL for an ImageField/FileField.
    If the value is already an external URL (http/https), return it unchanged.
    """
    if not file_field:
        return None

    if file_field.name.startswith(("http://", "https://")):
        return file_field.name

    domain = getattr(settings, 'SITE_URL', 'http://127.0.0.1:8002')
    if settings.DEBUG and ("sslip.io" in domain or "localhost" in domain):
        domain = "http://127.0.0.1:8002"

    return f"{domain.rstrip('/')}{file_field.url}"


def send_user_deactivation_email(user, reason):
    """
    Sends an email notification to the user informing them that their account has been deactivated, along with the specified reason.
    """
    subject = "Account Deactivation Notice - KIREIZ Space"
    recipient_email = user.email
    if not recipient_email:
        return False

    user_name = f"{user.firstName or ''} {user.lastName or ''}".strip() or user.userName or "Valued Customer"

    message_text = f"""Hello {user_name},

Your account on KIREIZ Space has been deactivated by an administrator.

Reason for Deactivation:
{reason}

If you believe this was done in error or have any questions regarding your account status, please contact our support team.

Best regards,
KIREIZ Space Support Team
"""

    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; margin: 0; padding: 20px; }}
        .card {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #efe5dd; }}
        .header {{ border-bottom: 2px solid #a85a32; padding-bottom: 15px; margin-bottom: 20px; }}
        .title {{ color: #a85a32; font-size: 22px; font-weight: bold; margin: 0; }}
        .reason-box {{ background: #fff5f5; border-left: 4px solid #f04444; padding: 15px; margin: 20px 0; border-radius: 6px; }}
        .reason-title {{ font-weight: bold; color: #991b1b; margin-bottom: 6px; }}
        .reason-content {{ color: #4b5563; font-size: 15px; line-height: 1.5; white-space: pre-wrap; }}
        .footer {{ margin-top: 30px; font-size: 13px; color: #777; border-top: 1px solid #eee; padding-top: 15px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h2 class="title">KIREIZ Space</h2>
        </div>
        <p>Hello <strong>{user_name}</strong>,</p>
        <p>Your account on <strong>KIREIZ Space</strong> has been deactivated by an administrator.</p>

        <div class="reason-box">
          <div class="reason-title">Reason for Deactivation:</div>
          <div class="reason-content">{reason}</div>
        </div>

        <p>If you believe this decision was made in error or if you have any questions, please contact our support team.</p>

        <div class="footer">
          <p>&copy; KIREIZ Space. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    """

    try:
        from django.core.mail import EmailMultiAlternatives
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or getattr(settings, 'EMAIL_HOST_USER', 'noreply@kireiz.com')
        email = EmailMultiAlternatives(
            subject=subject,
            body=message_text,
            from_email=from_email,
            to=[recipient_email],
        )
        email.attach_alternative(html_message, "text/html")
        email.send(fail_silently=False)
        return True
    except Exception as e:
        print(f"Error sending deactivation email to {recipient_email}: {e}")
        return False
    

# for local
# from django.conf import settings

# def new_build_media_url(file_field):
#     if not file_field:
#         return None

#     if file_field.url.startswith(("http://", "https://")):
#         return file_field.url

#     return f"{settings.SITE_URL.rstrip('/')}{file_field.url}"