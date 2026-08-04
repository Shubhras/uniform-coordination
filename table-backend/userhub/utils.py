import jwt
from django.conf import settings
from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.enums import TA_CENTER 
from reportlab.lib.enums import TA_RIGHT, TA_CENTER,TA_LEFT
from reportlab.platypus import Flowable
from django.core.mail import send_mail

from userhub.models import Users

def generate_custom_tokens(user):
    """Generate custom access & refresh tokens for normal Users."""

    access_payload = {
        "user_id": user.id,
        "email": user.email,
        "type": "access",
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow(),
    }

    refresh_payload = {
        "user_id": user.id,
        "email": user.email,
        "type": "refresh",
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow(),
    }

    access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm="HS256")
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm="HS256")

    return {
        "access": access_token,
        "refresh": refresh_token,
    }





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
 

class RoundedKFBox(Flowable):
    def __init__(self, width=45, height=45, radius=6):
        super().__init__()
        self.width = width
        self.height = height
        self.radius = radius

    def draw(self):
        c = self.canv
        c.setFillColor(colors.HexColor("#0B3C5D"))
        c.roundRect(0, 0, self.width, self.height, self.radius, fill=1)

        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 18)

        text_width = c.stringWidth("KF", "Helvetica-Bold", 18)
        c.drawString(
            (self.width - text_width) / 2,
            (self.height - 18) / 2 + 3,
            "KF"
        )


# def generate_customization_pdf(obj, user):
#     file_name = f"customization_{obj.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
#     file_path = os.path.join(settings.MEDIA_ROOT, "exports", file_name)
#     os.makedirs(os.path.dirname(file_path), exist_ok=True)

#     doc = SimpleDocTemplate(
#         file_path,
#         pagesize=A4,
#         rightMargin=40,
#         leftMargin=40,
#         topMargin=40,
#         bottomMargin=40,
#     )

#     styles = getSampleStyleSheet()
#     elements = []

    
#     # LOGO STYLES (SAFE & TESTED)
#     logo_kf_style = ParagraphStyle(
#         "LogoKF",
#         fontSize=22,
#         fontName="Helvetica-Bold",
#         textColor=colors.white,
#         alignment=TA_LEFT,
#         leading=25
#     )

#     logo_text_style = ParagraphStyle(
#         "LogoText",
#         fontSize=14,
#         fontName="Helvetica-Bold",
#         textColor=colors.HexColor("#0B3C5D"),
#         leading=16
#     )

#     logo_tagline_style = ParagraphStyle(
#         "LogoTagline",
#         fontSize=9,
#         textColor=colors.HexColor("#0B3C5D"),
#         leading=2
#     )

    
#     # MAIN STYLES
    
#     title_style = ParagraphStyle(
#         "TitleStyle",
#         parent=styles["Title"],
#         fontSize=22,
#         alignment=TA_CENTER,
#         textColor=colors.HexColor("#1F3A5F"),
#         spaceAfter=25
#     )

#     section_style = ParagraphStyle(
#         "SectionStyle",
#         parent=styles["Heading2"],
#         fontSize=14,
#         textColor=colors.HexColor("#154360"),
#         spaceBefore=20,
#         spaceAfter=10
#     )

#     normal_style = ParagraphStyle(
#         "NormalStyle",
#         parent=styles["Normal"],
#         fontSize=10,
#         leading=14,
#         spaceAfter=6
#     )

#     muted_style = ParagraphStyle(
#         "MutedStyle",
#         parent=styles["Normal"],
#         fontSize=9,
#         textColor=colors.grey
#     )
#     #<--------------LOGO LEFT TEXT------------->
#     left_logo_block = Table(
#         [
#             [RoundedKFBox()],
#             [Paragraph("Cleanliness and Trust.", logo_tagline_style)],
#         ],
#         colWidths=[100]
#     )

#     left_logo_block.setStyle(TableStyle([
#         ("ALIGN", (0, 1), (0, 1), "CENTER"),
#         ("TOPPADDING", (0, 1), (0, 1), 4),
#         ("LEFTPADDING", (0, 0), (-1, -1), 0),
#         ("RIGHTPADDING", (0, 0), (-1, -1), 0),
#         ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
#     ]))

#    #<-----------------LOGO RIGHT TEXT-----------------> 
#     right_logo_text = Table(
#     [   [Spacer(1, 8)],
#         [Paragraph("KIREIZ", logo_text_style)],
#         [Paragraph("FORM", logo_text_style)],
#     ],
#     colWidths=[140]
#     )

#     right_logo_text.setStyle(TableStyle([
#         ("LEFTPADDING", (0, 0), (-1, -1), 0),
#         ("RIGHTPADDING", (0, 0), (-1, -1), 0),
#         ("TOPPADDING", (0, 0), (-1, -1), 0),
#         ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
#     ]))

# #<----------------------MAIN LOGO----------------->
#     logo_table = Table(
#     [
#         [left_logo_block, right_logo_text],
#     ],
#     colWidths=[55, 440]
#     )

#     logo_table.setStyle(TableStyle([
#     ("VALIGN", (0, 0), (-1, -1), "TOP"),
#     ("LEFTPADDING", (0, 0), (-1, -1), 0),
#     ("RIGHTPADDING", (0, 0), (-1, -1), 0),
#     ("TOPPADDING", (0, 0), (-1, -1), 0),
#     ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
#     ]))


#     elements.append(logo_table)
#     elements.append(Spacer(1, 20))

    
#     # TITLE
    
#     elements.append(Paragraph("Customization Summary", title_style))
   
#     # USER INFO
#     full_name = f"{user.firstName or ''} {user.lastName or ''}".strip()
#     user_data = [
#         ["Customization ID", obj.id],
#         ["User", full_name or user.email],
#         ["Email", user.email],
#     ]
#     user_table = Table(user_data, colWidths=[150, 330])
#     user_table.setStyle(TableStyle([
#         ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F4F6F7")),
#         ("GRID", (0, 0), (-1, -1), 0.3, colors.lightgrey),
#         ("FONT", (0, 0), (0, -1), "Helvetica-Bold"),
#         ("FONTSIZE", (0, 0), (-1, -1), 10),
#         ("LEFTPADDING", (0, 0), (-1, -1), 8),
#         ("RIGHTPADDING", (0, 0), (-1, -1), 8),
#         ("TOPPADDING", (0, 0), (-1, -1), 8),
#         ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
#     ]))

#     elements.append(user_table)

    
#     # PRODUCT DETAILS
    
#     product = obj.model_info.product
#     elements.append(Paragraph("Product Details", section_style))
#     product_table = Table(
#         [
#             ["Product Name", product.productName],
#             ["Product Type", product.productType],
#             ["Price", f"{product.price}"],
#         ],
#         colWidths=[250, 250]
#     )
#     product_table.setStyle(TableStyle([
#         ("GRID", (0, 0), (-1, -1), 0.3, colors.grey),
#         ("FONT", (0, 0), (0, -1), "Helvetica-Bold"),
#         ("FONTSIZE", (0, 0), (-1, -1), 10),
#         ("BACKGROUND", (0, 0), (-1, -1), colors.whitesmoke),
#         ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
#         ("TOPPADDING", (0, 0), (-1, -1), 8),
#     ]))

#     elements.append(product_table)

    
#     # FOOTER
   
#     elements.append(Spacer(1, 30))
#     elements.append(
#         Paragraph(
#             f"Generated on {datetime.now().strftime('%d %b %Y, %I:%M %p')}",
#             muted_style
#         )
#     )

#     doc.build(elements)
#     return f"{settings.MEDIA_URL}exports/{file_name}"


from reportlab.platypus import Image

def generate_customization_pdf(obj, user):
    file_name = f"customization_{obj.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
    file_path = os.path.join(settings.MEDIA_ROOT, "exports", file_name)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()
    elements = []

    # MAIN STYLES (unchanged)
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Title"],
        fontSize=22,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1F3A5F"),
        spaceAfter=25
    )

    section_style = ParagraphStyle(
        "SectionStyle",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=colors.HexColor("#154360"),
        spaceBefore=20,
        spaceAfter=10
    )

    normal_style = ParagraphStyle(
        "NormalStyle",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        spaceAfter=6
    )

    muted_style = ParagraphStyle(
        "MutedStyle",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.grey
    )

    from uniformAdmin.models import SystemSettings  # adjust import to your actual path

    system_settings = SystemSettings.load()

    if system_settings.logo and os.path.exists(system_settings.logo.path):
        logo_img = Image(system_settings.logo.path, width=140, height=140)
        logo_img.hAlign = "CENTER"
        elements.append(logo_img)
    # else: silently skip — no crash if the file's missing

    elements.append(Spacer(1, 20))

    # TITLE
    elements.append(Paragraph("Customization Summary", title_style))

    # USER INFO
    full_name = f"{user.firstName or ''} {user.lastName or ''}".strip()
    user_data = [
        ["Customization ID", obj.id],
        ["User", full_name or user.email],
        ["Email", user.email],
    ]
    user_table = Table(user_data, colWidths=[150, 330])
    user_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F4F6F7")),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.lightgrey),
        ("FONT", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(user_table)

    # PRODUCT DETAILS
    product = obj.model_info.product
    elements.append(Paragraph("Product Details", section_style))
    product_table = Table(
        [
            ["Product Name", product.productName],
            ["Product Type", product.productType],
            ["Price", f"{product.price}"],
        ],
        colWidths=[250, 250]
    )
    product_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.3, colors.grey),
        ("FONT", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BACKGROUND", (0, 0), (-1, -1), colors.whitesmoke),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(product_table)

    # FOOTER
    elements.append(Spacer(1, 30))
    elements.append(
        Paragraph(
            f"Generated on {datetime.now().strftime('%d %b %Y, %I:%M %p')}",
            muted_style
        )
    )

    doc.build(elements)
    return f"{settings.MEDIA_URL}exports/{file_name}"



def generate_quotation_pdf(quotation, request):
    file_name = f"quotation_{quotation.quotation_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
    file_path = os.path.join(settings.MEDIA_ROOT, "exports", file_name)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    styles = getSampleStyleSheet()
    elements = []
     
    # LOGO STYLES (SAFE & TESTED)
    
    logo_kf_style = ParagraphStyle(
        "LogoKF",
        fontSize=22,
        fontName="Helvetica-Bold",
        textColor=colors.white,
        alignment=TA_LEFT,
        leading=25
    )
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
    
    # MAIN STYLES
    
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Title"],
        fontSize=22,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1F3A5F"),
        spaceAfter=25
    )
    section_style = ParagraphStyle(
        "SectionStyle",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=colors.HexColor("#154360"),
        spaceBefore=20,
        spaceAfter=10
    )
    normal_style = ParagraphStyle(
        "NormalStyle",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        spaceAfter=6
    )
    muted_style = ParagraphStyle(
        "MutedStyle",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.grey
    )
    #<--------------LOGO LEFT TEXT------------->
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

   #<-----------------LOGO RIGHT TEXT-----------------> 
    right_logo_text = Table(
    [   [Spacer(1, 8)],
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
#<----------------------MAIN LOGO----------------->
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

    # Custom Styles
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Title"],
        fontSize=20,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#2E4053"),
        spaceAfter=20
    )
    label_style = ParagraphStyle(
        "LabelStyle",
        parent=styles["Normal"],
        fontSize=11,
        textColor=colors.black,
        spaceAfter=6
    )
    value_style = ParagraphStyle(
        "ValueStyle",
        parent=styles["Normal"],
        fontSize=11,
        textColor=colors.HexColor("#34495E"),
        spaceAfter=10
    )
    section_style = ParagraphStyle(
        "SectionStyle",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=colors.HexColor("#1F618D"),
        spaceBefore=20,
        spaceAfter=10
    )

    # Title
    elements.append(Paragraph("Quotation Summary", title_style))
    elements.append(Spacer(1, 12))

    # Quotation Details Section
    elements.append(Paragraph("Quotation Details", section_style))

    data = [
        ["Quotation ID", quotation.quotation_id],
        ["Company Name", quotation.company_name],
        ["Email", quotation.email],
        ["Phone Number",quotation.phone_number],
        ["Item Type",quotation.item_type],
        ["Material",quotation.material],
        ["Size Quantity",quotation.size_quantity],
        ["delivery_date",quotation.delivery_date],
    ]
    table = Table(data, colWidths=[160, 320])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.whitesmoke),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONT", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONT", (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 11),
        ("ALIGN", (0, 0), (0, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
    ]))

    elements.append(table)

    # Footer
    elements.append(Spacer(1, 550))  
    elements.append(
        Paragraph(
            f"Generated on: {datetime.now().strftime('%d %b %Y, %I:%M %p')}",
            ParagraphStyle(
                "FooterStyle",
                parent=styles["Normal"],
                fontSize=9,
                alignment=TA_RIGHT,
                textColor=colors.grey
            )
        )
    )

    doc.build(elements)

    return file_path


def generate_payment_pdf(payment, user, request=None):

    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    file_name = f"payment_{payment.id}_{timestamp}.pdf"
    file_path = os.path.join(settings.MEDIA_ROOT, "exports", file_name)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()
    elements = []

    CURRENCY_SYMBOLS = {
        "USD": "$",
        "INR": "₹",
        "EUR": "€",
        "GBP": "£",
    }
    currency_code = (payment.currency or "").upper()
    currency_symbol = CURRENCY_SYMBOLS.get(currency_code, currency_code)

    # Styles
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Title"],
        fontSize=22,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1F3A5F"),
        spaceAfter=25
    )
    section_style = ParagraphStyle(
        "SectionStyle",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=colors.HexColor("#154360"),
        spaceBefore=20,
        spaceAfter=10
    )
    muted_style = ParagraphStyle(
        "MutedStyle",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.grey
    )

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

    # --- LOGO ---
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

    # Title
    elements.append(Paragraph("Payment Summary", title_style))

    # User Info
    full_name = f"{user.firstName or ''} {user.lastName or ''}".strip()
    user_data = [
        ["Payment ID", payment.id],
        ["User", full_name or user.email],
        ["Email", user.email],
    ]
    user_table = Table(user_data, colWidths=[150, 330])
    user_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F4F6F7")),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.lightgrey),
        ("FONT", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(user_table)

    # Payment Details
    elements.append(Paragraph("Payment Details", section_style))
    payment_data = [
        ["Order ID", getattr(payment, "order", None) and payment.order.order_id or "-"],
        ["Payment Status", (payment.payment_status or "").capitalize()],
        ["Payment Method", payment.payment_method or "-"],
        ["Amount", f"{currency_symbol} {float(payment.amount):,.2f}" if payment.amount else "-"],
        ["Currency", currency_symbol],
        ["Paid At", payment.paid_at.strftime("%d %b %Y, %I:%M %p") if payment.paid_at else "-"],
        ["Customer ID", payment.customer_id or "-"],
        ["Payment Method ID", payment.payment_method_id or "-"],
    ]
    payment_table = Table(payment_data, colWidths=[250, 250])
    payment_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.3, colors.grey),
        ("FONT", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BACKGROUND", (0, 0), (-1, -1), colors.whitesmoke),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(payment_table)

    # Footer
    elements.append(Spacer(1, 30))
    elements.append(
        Paragraph(
            f"Generated on {datetime.now().strftime('%d %b %Y, %I:%M %p')}",
            muted_style
        )
    )

    doc.build(elements)
    pdf_relative_url = f"{settings.MEDIA_URL}exports/{file_name}"
    if request:
        return request.build_absolute_uri(pdf_relative_url)
    return pdf_relative_url


# logger = logging.getLogger(__name__)
# def send_notification(user, notification_type, subject, message):
#     print("Notification function called")
   
#     try:
#         with transaction.atomic():

#             notification = Notification.objects.create(
#                 user=user,
#                 notification_type=notification_type,
#                 subject=subject,
#                 message=message,
#             )

#             send_mail(
#                 subject=subject,
#                 message=message,
#                 from_email=settings.DEFAULT_FROM_EMAIL,
#                 recipient_list=[user.email],
#                 fail_silently=False,
#             )
#             notification.is_sent = True
#             notification.sent_at = timezone.now()
#             notification.save(update_fields=["is_sent", "sent_at"])
#             print("Sending to:", user.email)


#             return notification
        

#     except Exception as e:

#         logger.error(
#             f"Notification sending failed for user {user.id}: {str(e)}",
#             exc_info=True
#         )
#         raise Exception("Notification service temporarily unavailable.")



def send_admin_quotation_email(quotation):
    subject = f"New Quotation create {quotation.quotation_id}"

    message = f"""
            New Quotation Request Create

    Quotation ID     :    {quotation.quotation_id}
    Company_name     :    {quotation.company_name}
    Contact Person   :    {quotation.contact_person}
    Email            :    {quotation.email}
    Phone            :    {quotation.phone_number}

    Item Type:            {quotation.item_type}
    Material:             {quotation.material}
    Size & Quantity  :    {quotation.size_quantity}
    Delivery Date    :    {quotation.delivery_date}
    Additional Note  :    {quotation.additional_note}
    Status           :    {quotation.quotation_status}
    Workflow Status  :    {quotation.workflow_status}

    Created At       :  {quotation.created_at}
    """

    # admin_emails = list(
    #     Users.objects.filter(userType="admin")
    #     .exclude(email="")
    #     .values_list("email", flat=True)
    # )

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        ["rt61240@gmail.com"],  )
        # admin_emails
        


def send_registration_email(user):
    full_name = f"{user.firstName or ''} {user.lastName or ''}".strip()

    if not full_name:
        full_name = "User"

    subject = "Welcome to UserHub!"

    message = f"""
Dear {full_name},

Welcome to KIREIZ SPACE!

Thank you for creating your account with us. Your registration has been completed successfully.

You can now access your account and enjoy our services.

If you did not create this account, please contact our support team immediately.

Thank you for choosing KIREIZ SPACE.

Best Regards,
KIREIZ SPACE Team
"""

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[user.email],
        fail_silently=False,
    )


def send_login_alert_email(user):
    send_mail(
        subject="Login Alert",
        message=f"""
Hello {user.firstName if user.lastName else "User"},

Your account has been logged in successfully.

If this was not you, please change your password immediately.

Thank You,
KIREIZ SPACE Team
""",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[user.email],
        fail_silently=False,
    )

def send_order_confirmation_email(user, order, start_date, end_date, total_amount):
    send_mail(
        subject="Order Confirmation",
        message=f"""
Hello {user.userName},

Your order has been placed successfully 

Order ID: {order.order_id}
Rental Period: {start_date} to {end_date}
Total Amount: ₹{total_amount}

Thank You,
UserHub Team
""",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[user.email],   
        fail_silently=False,
    )
    
    



def send_payment_success_email(user, payment, currency_symbol="¥"):
    send_mail(
        subject="Payment Successful - KIREIZ SPACE",
        message=f"""
Dear {user.firstName if user.lastName else "User"},

Thank you for your payment. We have successfully received your transaction.

Payment Details:
----------------
Payment ID: {payment.id}
Order ID: {payment.order.order_id if hasattr(payment, 'order') and payment.order else '-'}
Amount: {currency_symbol}{payment.amount}
Date: {payment.paid_at.strftime('%Y-%m-%d %H:%M') if payment.paid_at else 'N/A'}

You can download your payment receipt from your dashboard.
If you have any questions, please contact our support team.

Best Regards,
KIREIZ SPACE Team
""",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[user.email],
        fail_silently=False,
    )

def send_payment_failed_email(user, payment, currency_symbol="¥"):
    send_mail(
        subject="Payment Failed - KIREIZ SPACE",
        message=f"""
Dear {user.firstName if user.lastName else "User"},

We attempted to process your recent payment, but it unfortunately failed.

Payment Details:
----------------
Payment ID: {payment.id}
Order ID: {payment.order.order_id if hasattr(payment, 'order') and payment.order else '-'}
Attempted Amount: {currency_symbol}{payment.amount}

Please log in to your dashboard to update your payment method or try the transaction again.
If you believe this is an error, please contact your bank or our support team for assistance.

Best Regards,
KIREIZ SPACE Team
""",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[user.email],
        fail_silently=False,
    )

def send_return_received_email(user, order):
    send_mail(
        subject="Return Received Successfully - KIREIZ SPACE",
        message=f"""
Dear {user.firstName if user.lastName else "User"},

We have successfully received the returned items for your order.

Order ID: {order.order_id}

Our team will now inspect the items. Once the inspection is complete, we will update the order status in your dashboard.
Thank you for using KIREIZ SPACE!

Best Regards,
KIREIZ SPACE Team
""",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[user.email],
        fail_silently=False,
    )

def send_rental_return_reminder_email(user, order, return_deadline):
    send_mail(
        subject="Reminder: Rental Return Deadline Approaching - KIREIZ SPACE",
        message=f"""
Dear {user.firstName if user.lastName else "User"},

This is a friendly reminder that the return deadline for your rented items is approaching.

Order ID: {order.order_id}
Return Deadline: {return_deadline}

Please ensure all items are packed securely and returned by the deadline to avoid any late fees. 
If you have already shipped the return, please disregard this email.

Best Regards,
KIREIZ SPACE Team
""",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[user.email],
        fail_silently=False,
    )



import re

def parse_size_quantity(size_quantity_str):
    """
    'XS-1, S-1, M-1' -> [{"size": "XS", "qty": 1}, {"size": "S", "qty": 1}, {"size": "M", "qty": 1}]
    """
    result = []
    if not size_quantity_str:
        return result
    for chunk in size_quantity_str.split(','):
        chunk = chunk.strip()
        match = re.match(r'([A-Za-z0-9]+)\s*[-:]\s*(\d+)', chunk)
        if match:
            result.append({"size": match.group(1).upper(), "qty": int(match.group(2))})
    return result    
    