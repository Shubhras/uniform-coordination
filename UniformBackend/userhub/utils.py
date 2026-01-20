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
    file_name = f"quotation_{quotation.uuids}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
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

    return f"{settings.MEDIA_URL}exports/{file_name}"
