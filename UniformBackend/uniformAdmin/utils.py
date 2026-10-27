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

    price = float(getattr(product, "price", 0) or 0) if product else 0
    discount = float(getattr(product, "discount", 0) or 0) if product else 0
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

    product = None
    try:
        if getattr(quotation, "customupdatemodel", None) and getattr(quotation.customupdatemodel, "model_info", None):
            product = getattr(quotation.customupdatemodel.model_info, "product", None)
    except Exception:
        product = None

    price = float(getattr(product, "price", 0) or 0) if product else 0
    discount = float(getattr(product, "discount", 0) or 0) if product else 0

    size_qty_str = str(getattr(quotation, "size_quantity", "") or "")
    numbers = re.findall(r"\d+", size_qty_str) if size_qty_str else []
    qty = sum(int(x) for x in numbers) if numbers else 1
    subtotal = qty * price
    discount_amt = (subtotal * discount) / 100
    total = subtotal - discount_amt

    # Prioritize manual quotation figures entered by admin if present
    try:
        if getattr(quotation, "subtotal", None) is not None and float(quotation.subtotal) > 0:
            subtotal = float(quotation.subtotal)
            if getattr(quotation, "discount_percent", None) is not None:
                discount = float(quotation.discount_percent)
            discount_amt = (subtotal * discount) / 100
            if getattr(quotation, "total", None) is not None and float(quotation.total) > 0:
                total = float(quotation.total)
            else:
                total = subtotal - discount_amt
            if qty > 0:
                price = round(subtotal / qty, 2)
    except Exception:
        pass

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
    valid_date_val = getattr(quotation, "valid_until", None) or getattr(quotation, "delivery_date", None)
    valid = valid_date_val.strftime("%d/%m/%Y") if valid_date_val else today

    elements.append(Paragraph(f"<b>Date:</b> {today}", normal))
    elements.append(Paragraph(f"<b>Valid until:</b> {valid}", normal))

    elements.append(Spacer(1, 20))

    # ---------- BODY ----------
    contact_name = getattr(quotation, "contact_person", None) or getattr(quotation, "name", None) or "Valued Customer"
    elements.append(Paragraph(f"Dear {contact_name},", normal))
    elements.append(Spacer(1, 10))

    elements.append(Paragraph(
        "Thank you for your interest in our products. Based on your requirements, we are pleased to offer the following quotation:",
        normal
    ))

    elements.append(Spacer(1, 20))

    # ---------- PRODUCT ----------
    item_type = getattr(quotation, "item_type", None) or "Custom Uniform"
    material = getattr(quotation, "material", None) or "-"
    elements.append(Paragraph(f"<b>Item:</b> {item_type}", normal))
    elements.append(Paragraph(f"<b>Material:</b> {material}", normal))
    elements.append(Paragraph(f"<b>Quantity:</b> {qty} pieces", normal))
    elements.append(Paragraph(f"<b>Unit Price:</b> {price}", normal))

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
    role_name = ""
    if getattr(user, "role", None):
        role_name = getattr(user.role, "role_name", "") or ""
    elif getattr(user, "role_id", None):
        try:
            from .models import Role
            role_obj = Role.objects.filter(id=user.role_id).first()
            if role_obj:
                role_name = role_obj.role_name or ""
        except Exception:
            pass

    role_lower = str(role_name).lower().strip()
    is_b2b = role_lower in ["b2b", "b2b_user", "b2b user", "client"]
    is_sales = role_lower in ["sales", "sales_rep", "sales_representative"]

    def row(label, value):
        return f"{label:<15} : {value if value is not None else ''}"

    if is_b2b:
        subject = "Welcome to Our B2B Portal 🎉"
        header = "WELCOME B2B USER"
        intro = "Your B2B account has been successfully created."
        rows = [
            row("Name", getattr(user, "name", "")),
            row("Company", getattr(user, "company_name", "")),
            row("Email", getattr(user, "email", "")),
            row("Mobile", getattr(user, "mobile", "")),
            row("Tier", getattr(user, "tier", "")),
            row("Password", raw_password),
        ]
    elif is_sales:
        subject = "Welcome to KIREIZ - Sales Representative Credentials 🎉"
        header = "WELCOME TO KIREIZ SALES PORTAL"
        intro = "Your Sales Representative account has been successfully created. Here are your login credentials:"
        rows = [
            row("Name", getattr(user, "name", "")),
            row("Role", "Sales Representative"),
            row("Designation", getattr(user, "designation", "Sales Representative")),
            row("Email", getattr(user, "email", "")),
        ]
        if getattr(user, "mobile", None):
            rows.append(row("Mobile", user.mobile))
        rows.append(row("Password", raw_password))
    else:
        role_display = role_name.replace("_", " ").title() if role_name else "Admin"
        subject = "Welcome to KIREIZ Admin Portal 🎉"
        header = "WELCOME TO KIREIZ ADMIN PORTAL"
        intro = f"Your {role_display} account has been successfully created."
        rows = [
            row("Name", getattr(user, "name", "")),
            row("Role", role_display),
        ]
        if getattr(user, "company_name", None):
            rows.append(row("Company", user.company_name))
        rows.append(row("Email", getattr(user, "email", "")))
        if getattr(user, "mobile", None):
            rows.append(row("Mobile", user.mobile))
        rows.append(row("Password", raw_password))

    details_text = "\n        ".join(rows)

    message = f"""
                    {header}

        Hello {getattr(user, "name", "")},

        {intro}

        {details_text}

        Please login and change your password after first login.

        """

    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", None) or getattr(settings, "EMAIL_HOST_USER", "noreply@kireiz.com")
    send_mail(
        subject,
        message,
        from_email,
        [user.email],  
        fail_silently=False,
    )




from django.conf import settings

def get_file_url(file_field):
    """
    Returns the correct absolute URL for a FileField/ImageField.
    Supports both local media files and external URLs.
    """
    if not file_field:
        return None

    if file_field.name.startswith(("http://", "https://")):
        return file_field.name

    return f"{settings.SITE_URL}{file_field.url}"  


def new_build_media_url(file_field):
    """
    Returns absolute media URL for a FileField/ImageField
    Works without request object
    """
    if not file_field:
        return None

    name = getattr(file_field, "name", str(file_field))
    if str(name).startswith(("http://", "https://")):
        return str(name)

    domain = getattr(settings, "SITE_DOMAIN", "") or ""
    if "dxtspace.com" in domain:
        domain = getattr(settings, "SITE_URL", "") or ""
    if "dxtspace.com" in domain:
        domain = ""
    domain = domain.rstrip("/")
    media_url = getattr(settings, "MEDIA_URL", "/media/")
    return f"{domain}{media_url}{name}"  

def build_media_url(request, file_field):
    if not file_field:
        return None

    # Already an absolute URL (e.g. Unsplash)
    if file_field.name.startswith(("http://", "https://")):
        return file_field.name

    return f"{settings.SITE_URL}{file_field.url}"
