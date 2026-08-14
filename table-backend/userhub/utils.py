import jwt
from django.conf import settings
from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
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

    cell_style = ParagraphStyle(
        "TableCellStyle",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#2C3E50")
    )

    cell_bold_style = ParagraphStyle(
        "TableCellBoldStyle",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#1A252F")
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
        [Paragraph("Customization ID", cell_bold_style), Paragraph(str(obj.id), cell_style)],
        [Paragraph("User", cell_bold_style), Paragraph(full_name or user.email, cell_style)],
        [Paragraph("Email", cell_bold_style), Paragraph(user.email, cell_style)],
    ]
    user_table = Table(user_data, colWidths=[150, 330])
    user_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F4F6F7")),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.lightgrey),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(user_table)

    # PRODUCT DETAILS
    product = obj.model_info.product if (obj.model_info and obj.model_info.product) else None
    product_name = product.productName if product else "N/A"
    product_type = getattr(product, "type", None) or getattr(product, "productType", None) or "N/A"
    product_price = f"{product.price}" if product else "N/A"

    elements.append(Paragraph("Product Details", section_style))
    product_table = Table(
        [
            [Paragraph("Product Name", cell_bold_style), Paragraph(product_name, cell_style)],
            [Paragraph("Product Type", cell_bold_style), Paragraph(product_type, cell_style)],
            [Paragraph("Price", cell_bold_style), Paragraph(product_price, cell_style)],
        ],
        colWidths=[250, 250]
    )
    product_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.3, colors.grey),
        ("BACKGROUND", (0, 0), (-1, -1), colors.whitesmoke),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(product_table)

    # DESIGN SPECIFICATIONS SECTION
    elements.append(Paragraph("Design Specifications", section_style))
    spec_rows = []

    specs = obj.design_specifications or {}
    config = obj.config_json or {}

    def extract_val(data, key):
        if not isinstance(data, dict):
            return None
        val = data.get(key)
        if val is None:
            val = data.get(key.lower())
        if val is None:
            val = data.get(key.capitalize())
        if isinstance(val, dict):
            return val.get("name") or val.get("colorName") or val.get("fabricName") or str(val)
        if val:
            return str(val)
        return None

    # Attribute values extraction
    style_val = extract_val(specs, "style") or extract_val(config, "style") or (getattr(product, "style", None) if product else None)
    type_val = product_type or extract_val(specs, "type") or extract_val(config, "type")
    table_shape_val = extract_val(specs, "table_shape") or extract_val(specs, "tableShape") or extract_val(config, "table_shape") or (getattr(product, "table_shape", None) if product else None)
    
    color_val = extract_val(specs, "color") or extract_val(config, "color")
    if not color_val and isinstance(specs.get("color_details"), dict):
        color_val = specs["color_details"].get("name") or specs["color_details"].get("colorName")
    if not color_val and product and getattr(product, "color", None):
        color_val = getattr(product.color, "colorName", None) or getattr(product.color, "name", None)

    fabric_val = extract_val(specs, "fabric") or extract_val(config, "fabric") or extract_val(config, "material")
    if not fabric_val and isinstance(specs.get("fabric_details"), dict):
        fabric_val = specs["fabric_details"].get("name") or specs["fabric_details"].get("fabricName")
    if not fabric_val and product and getattr(product, "fabric", None):
        fabric_val = getattr(product.fabric, "fabricName", None) or getattr(product.fabric, "name", None)

    size_val = extract_val(specs, "size") or extract_val(config, "size") or (getattr(product, "size", None) if product else None)
    
    closure_val = extract_val(specs, "closure") or extract_val(config, "closure")
    if not closure_val and isinstance(specs.get("closure_details"), dict):
        closure_val = specs["closure_details"].get("name")
    if not closure_val and product and getattr(product, "closure", None):
        closure_val = getattr(product.closure, "name", None)

    pattern_val = extract_val(specs, "pattern") or extract_val(config, "pattern")
    if not pattern_val and isinstance(specs.get("pattern_details"), dict):
        pattern_val = specs["pattern_details"].get("name")
    if not pattern_val and product and getattr(product, "pattern", None):
        pattern_val = getattr(product.pattern, "name", None)

    all_specs = [
        ("Style", style_val),
        ("Type", type_val),
        ("Table Shape", table_shape_val),
        ("Color", color_val),
        ("Fabric", fabric_val),
        ("Size", size_val),
        ("Closure", closure_val),
        ("Pattern", pattern_val),
    ]

    for label, val in all_specs:
        if val:
            spec_rows.append([Paragraph(label, cell_bold_style), Paragraph(str(val), cell_style)])

    # Iterate additional nested category specifications in specs if any exist
    if isinstance(specs, dict):
        for cat_key, cat_val in specs.items():
            if isinstance(cat_val, dict) and cat_key not in ["color_details", "fabric_details", "closure_details", "pattern_details"]:
                for item_k, item_v in cat_val.items():
                    if item_v:
                        v_str = item_v.get("name") if isinstance(item_v, dict) else str(item_v)
                        if not any(r[0].text == item_k for r in spec_rows):
                            spec_rows.append([Paragraph(str(item_k), cell_bold_style), Paragraph(v_str, cell_style)])
            elif isinstance(cat_val, (str, int, float)) and cat_key not in ["style", "table_shape", "color", "fabric", "size", "closure", "pattern"]:
                label_name = cat_key.replace("_", " ").title()
                if not any(r[0].text == label_name for r in spec_rows):
                    spec_rows.append([Paragraph(label_name, cell_bold_style), Paragraph(str(cat_val), cell_style)])

    if not spec_rows:
        spec_rows.append([Paragraph("Status", cell_bold_style), Paragraph("Standard Design Configuration", cell_style)])

    spec_table = Table(spec_rows, colWidths=[250, 250])
    spec_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.3, colors.grey),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F9F9F9")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(spec_table)

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

    logo_path = os.path.join(settings.BASE_DIR, "../admin-table-coordination/public/img/logo/sidebar-logo.png")
    if os.path.exists(logo_path):
        logo_img = Image(logo_path, width=120, height=60)
        logo_img.hAlign = "LEFT"
        elements.append(logo_img)
    else:
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


def generate_contract_pdf(contract, request):
    file_name = f"contract_{contract.contract_id}.pdf"
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

    logo_path = os.path.join(settings.BASE_DIR, "../admin-table-coordination/public/img/logo/sidebar-logo.png")
    if os.path.exists(logo_path):
        logo_img = Image(logo_path, width=120, height=60)
        logo_img.hAlign = "LEFT"
        elements.append(logo_img)
    else:
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
    section_style = ParagraphStyle(
        "SectionStyle",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=colors.HexColor("#1F618D"),
        spaceBefore=20,
        spaceAfter=10
    )

    # Title
    elements.append(Paragraph("Rental Agreement / Contract", title_style))
    elements.append(Spacer(1, 12))

    # Contract Details Section
    elements.append(Paragraph("Contract Details", section_style))

    data = [
        ["Contract ID", contract.contract_id],
        ["Order ID", contract.order.order_id if contract.order else "N/A"],
        ["Company Name", contract.company_name or "N/A"],
        ["Contact Person", contract.contact_person or "N/A"],
        ["Email", contract.email],
        ["Phone Number", contract.phone_number or "N/A"],
        ["Delivery/Start Date", str(contract.delivery_date) if contract.delivery_date else "N/A"],
        ["Additional Note", contract.additional_note or "None"],
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

    # If there is an associated order, list its items!
    if contract.order:
        elements.append(Paragraph("Order Items", section_style))
        item_data = [["ProductName", "Quantity", "Price Per Day", "Subtotal"]]
        for item in contract.order.items.all():
            item_data.append([
                item.product.productName,
                str(item.quantity),
                f"${item.price_per_day}",
                f"${item.subtotal}"
            ])
        item_table = Table(item_data, colWidths=[200, 70, 100, 110])
        item_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EAEDED")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONT", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(item_table)

        # Order totals
        elements.append(Spacer(1, 10))
        total_data = [
            ["Subtotal", f"${contract.order.subtotal}"],
            ["Tax", f"${contract.order.tax}"],
            ["Shipping Charge", f"${contract.order.shipping_charge}"],
            ["Total Amount", f"${contract.order.total_amount}"],
        ]
        total_table = Table(total_data, colWidths=[380, 100])
        total_table.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "RIGHT"),
            ("FONT", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(total_table)

    # Footer
    elements.append(Spacer(1, 50))  
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

    logo_path = os.path.join(settings.BASE_DIR, "../admin-table-coordination/public/img/logo/sidebar-logo.png")
    if os.path.exists(logo_path):
        logo_img = Image(logo_path, width=120, height=60)
        logo_img.hAlign = "LEFT"
        elements.append(logo_img)
    else:
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
        


def send_dynamic_email(subject, message, recipient_list, from_email=None):
    from django.core.mail import get_connection, EmailMessage
    from uniformAdmin.models import SystemSettings
    import logging
    logger = logging.getLogger(__name__)

    try:
        settings_obj = SystemSettings.load()
        host = settings_obj.email_host
        port = settings_obj.email_port
        username = settings_obj.email_username
        password = settings_obj.email_password
        use_tls = settings_obj.email_use_tls

        from_addr = settings_obj.email_from_address or from_email or settings.EMAIL_HOST_USER
        from_name = settings_obj.email_from_name or "System"
        from_header = f"{from_name} <{from_addr}>"

        if host and username and password:
            connection = get_connection(
                backend='django.core.mail.backends.smtp.EmailBackend',
                host=host,
                port=int(port) if port else 587,
                username=username,
                password=password,
                use_tls=use_tls
            )
            email = EmailMessage(
                subject=subject,
                body=message,
                from_email=from_header,
                to=recipient_list,
                connection=connection
            )
            email.send(fail_silently=False)
            logger.info(f"Dynamically sent email to {recipient_list} via custom SMTP ({host})")
        else:
            from django.core.mail import send_mail
            send_mail(
                subject=subject,
                message=message,
                from_email=from_addr,
                recipient_list=recipient_list,
                fail_silently=False
            )
            logger.info(f"Sent email to {recipient_list} via default SMTP")
    except Exception as e:
        logger.error(f"Failed to send dynamic email to {recipient_list}: {str(e)}")

def send_registration_email(user):
    from uniformAdmin.models import SystemSettings
    settings_obj = SystemSettings.load()
    if not settings_obj.email_notify_registration:
        return

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

    send_dynamic_email(
        subject=subject,
        message=message,
        recipient_list=[user.email],
    )


def send_login_alert_email(user):
    send_dynamic_email(
        subject="Login Alert",
        message=f"""
Hello {user.firstName if user.lastName else "User"},

Your account has been logged in successfully.

If this was not you, please change your password immediately.

Thank You,
KIREIZ SPACE Team
""",
        recipient_list=[user.email],
    )

def send_order_confirmation_email(user, order, start_date, end_date, total_amount):
    from uniformAdmin.models import SystemSettings
    settings_obj = SystemSettings.load()
    if not settings_obj.email_notify_order_placed:
        return

    send_dynamic_email(
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
        recipient_list=[user.email],
    )

def send_payment_success_email(user, payment, currency_symbol="$"):
    from uniformAdmin.models import SystemSettings
    settings_obj = SystemSettings.load()
    if not settings_obj.email_notify_payment_success:
        return

    send_dynamic_email(
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
        recipient_list=[user.email],
    )

def send_payment_failed_email(user, payment, currency_symbol="$"):
    from uniformAdmin.models import SystemSettings
    settings_obj = SystemSettings.load()
    if not settings_obj.email_notify_payment_failure:
        return

    send_dynamic_email(
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
        recipient_list=[user.email],
    )

def send_return_received_email(user, order):
    from uniformAdmin.models import SystemSettings
    settings_obj = SystemSettings.load()
    if not settings_obj.email_notify_return_received:
        return

    send_dynamic_email(
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
        recipient_list=[user.email],
    )

def send_rental_return_reminder_email(user, order, return_deadline):
    from uniformAdmin.models import SystemSettings
    settings_obj = SystemSettings.load()
    if not settings_obj.email_notify_return_overdue:
        return

    send_dynamic_email(
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
        recipient_list=[user.email],
    )

def send_shipping_email(user, order):
    from uniformAdmin.models import SystemSettings
    settings_obj = SystemSettings.load()
    if not settings_obj.email_notify_shipping:
        return

    send_dynamic_email(
        subject="Your Order is Out for Delivery! 🚚",
        message=f"""
Dear {user.firstName if user.lastName else "User"},

Great news! Your order #{order.order_id} is out for delivery. 

It should arrive shortly. If you have any questions or require assistance, please contact our support team.

Best Regards,
KIREIZ SPACE Team
""",
        recipient_list=[user.email],
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


def generate_theme_customization_pdf(obj, user):
    file_name = f"theme_customization_{obj.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
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

    # MAIN STYLES
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Title"],
        fontSize=20,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1F3A5F"),
        spaceAfter=15
    )

    section_style = ParagraphStyle(
        "SectionStyle",
        parent=styles["Heading2"],
        fontSize=12,
        textColor=colors.HexColor("#154360"),
        spaceBefore=12,
        spaceAfter=6
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

    # TABLE CELL STYLES
    cell_style = ParagraphStyle(
        "TableCellStyle",
        parent=styles["Normal"],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#2C3E50")
    )
    cell_bold_style = ParagraphStyle(
        "TableCellBoldStyle",
        parent=styles["Normal"],
        fontSize=9,
        leading=12,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#1A252F")
    )
    prod_header_style = ParagraphStyle(
        "ProdHeaderStyle",
        parent=styles["Normal"],
        fontSize=9,
        leading=12,
        fontName="Helvetica-Bold",
        textColor=colors.whitesmoke
    )

    from uniformAdmin.models import SystemSettings

    system_settings = SystemSettings.load()

    if system_settings.logo and os.path.exists(system_settings.logo.path):
        logo_img = Image(system_settings.logo.path, width=90, height=90)
        logo_img.hAlign = "CENTER"
        elements.append(logo_img)

    elements.append(Spacer(1, 10))

    # TITLE
    elements.append(Paragraph("Theme Customization Summary", title_style))

    # USER INFO
    full_name = f"{user.firstName or ''} {user.lastName or ''}".strip()
    user_data = [
        [Paragraph("Customization ID", cell_bold_style), Paragraph(str(obj.id), cell_style)],
        [Paragraph("User", cell_bold_style), Paragraph(full_name or user.email, cell_style)],
        [Paragraph("Email", cell_bold_style), Paragraph(user.email, cell_style)],
    ]
    user_table = Table(user_data, colWidths=[150, 330])
    user_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F4F6F7")),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.lightgrey),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(user_table)

    # THEME DETAILS
    theme = obj.theme
    theme_table_data = [
        [Paragraph("Theme Name", cell_bold_style), Paragraph(theme.title, cell_style)],
    ]
    if theme.category:
        theme_table_data.append([Paragraph("Category", cell_bold_style), Paragraph(theme.category.categoryName, cell_style)])
    else:
        theme_table_data.append([Paragraph("Category", cell_bold_style), Paragraph("N/A", cell_style)])
        
    theme_table_data.append([Paragraph("Description", cell_bold_style), Paragraph(theme.description or "", cell_style)])

    theme_table = Table(theme_table_data, colWidths=[150, 330])
    theme_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.3, colors.grey),
        ("BACKGROUND", (0, 0), (-1, -1), colors.whitesmoke),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(Paragraph("Theme Details", section_style))
    elements.append(theme_table)

    # CUSTOM SELECTIONS (CONFIG)
    config = obj.config_json or {}
    shape_val = config.get("table_shape") or "Circle"
    
    scale_val = config.get("table_scale")
    scale_str = f"{scale_val} cm" if scale_val else "300 cm"
    if scale_val and "cm" in str(scale_val).lower():
        scale_str = str(scale_val)

    sitting_val = config.get("table_sitting")
    sitting_str = f"{sitting_val} Seats" if sitting_val else "6 Seats"
    if sitting_val and "seat" in str(sitting_val).lower():
        sitting_str = str(sitting_val)

    config_data = [
        [Paragraph("Table Shape", cell_bold_style), Paragraph(shape_val, cell_style)],
        [Paragraph("Table Scale", cell_bold_style), Paragraph(scale_str, cell_style)],
        [Paragraph("Table Seating", cell_bold_style), Paragraph(sitting_str, cell_style)],
    ]
    config_table = Table(config_data, colWidths=[150, 330])
    config_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.3, colors.grey),
        ("BACKGROUND", (0, 0), (-1, -1), colors.whitesmoke),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(Paragraph("Layout Configurations", section_style))
    elements.append(config_table)

    # CUSTOM CATEGORY OPTIONS
    specifications = obj.design_specifications or {}
    if specifications:
        spec_data = []
        for cat_name, options in specifications.items():
            if isinstance(options, dict):
                opt_str = ", ".join([f"{k}: {v}" for k, v in options.items()])
            else:
                opt_str = str(options)
            spec_data.append([Paragraph(cat_name, cell_bold_style), Paragraph(opt_str, cell_style)])
        
        if spec_data:
            spec_table = Table(spec_data, colWidths=[150, 330])
            spec_table.setStyle(TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.3, colors.grey),
                ("BACKGROUND", (0, 0), (-1, -1), colors.whitesmoke),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]))
            elements.append(Paragraph("Customized Item Specifications", section_style))
            elements.append(spec_table)

    # INCLUDED PRODUCTS IN THEME SETUP
    if obj.theme:
        theme_items = obj.theme.theme_items.select_related('product').all()
        if theme_items.exists():
            prod_data = []
            prod_data.append([
                Paragraph("Product Name", prod_header_style), 
                Paragraph("Section", prod_header_style), 
                Paragraph("Rental Price", prod_header_style)
            ])
            for item in theme_items:
                prod = item.product
                price_str = f"${prod.price:.2f}" if prod.price else "$0.00"
                section_str = item.get_section_display() or "N/A"
                prod_data.append([
                    Paragraph(prod.productName, cell_style),
                    Paragraph(section_str, cell_style),
                    Paragraph(price_str, cell_style)
                ])
            
            prod_table = Table(prod_data, colWidths=[200, 150, 130])
            prod_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1F3A5F")),
                ("GRID", (0, 0), (-1, -1), 0.3, colors.grey),
                ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]))
            elements.append(Paragraph("Included Products in Theme Setup", section_style))
            elements.append(prod_table)

    # FOOTER
    elements.append(Spacer(1, 15))
    elements.append(
        Paragraph(
            f"Generated on {datetime.now().strftime('%d %b %Y, %I:%M %p')}",
            muted_style
        )
    )

    doc.build(elements)
    return f"{settings.MEDIA_URL}exports/{file_name}"


def create_user_notification(user, title, message, notification_type='general', order=None):
    """
    Utility helper to create in-app UserNotification.
    """
    from .models import UserNotification, Users
    from django.db.models import Q
    try:
        target_user = user
        if not isinstance(target_user, Users):
            user_email = getattr(user, 'email', None)
            user_id = getattr(user, 'id', None)
            found_user = Users.objects.filter(Q(email=user_email) | Q(id=user_id)).first() if (user_email or user_id) else None
            if found_user:
                target_user = found_user
            else:
                return None

        notification = UserNotification.objects.create(
            user=target_user,
            title=title,
            message=message,
            notification_type=notification_type,
            order=order
        )
        return notification
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to create user notification: {e}")
        return None


def send_return_not_received_email(user, order):
    from uniformAdmin.models import SystemSettings
    settings_obj = SystemSettings.load()
    if hasattr(settings_obj, 'email_notify_return_overdue') and not settings_obj.email_notify_return_overdue:
        return

    send_dynamic_email(
        subject="Action Required: Return Items Not Received - KIREIZ SPACE",
        message=f"""
Dear {user.firstName if getattr(user, 'lastName', None) else "User"},

We have not yet received the returned items for your order #{order.order_id}.

Please return the items as soon as possible to avoid late fees or lost item charges.
If you have already dispatched the shipment, please update your tracking information or contact support.

Best Regards,
KIREIZ SPACE Team
""",
        recipient_list=[user.email],
    )


def send_late_fee_email(user, invoice_or_order, fee_amount=0):
    send_dynamic_email(
        subject="Late Fee Invoice Notice - KIREIZ SPACE",
        message=f"""
Dear {user.firstName if getattr(user, 'lastName', None) else "User"},

A late fee of ${fee_amount} has been assessed due to overdue rental items.

Please log in to your account dashboard to view details and clear outstanding charges.

Best Regards,
KIREIZ SPACE Team
""",
        recipient_list=[user.email],
    )


def send_lost_item_compensation_email(user, detail_msg=""):
    send_dynamic_email(
        subject="Compensation Charge Notice - KIREIZ SPACE",
        message=f"""
Dear {user.firstName if getattr(user, 'lastName', None) else "User"},

This is a notice regarding damaged or lost rental items on your account.

Details: {detail_msg}

Please view your account notifications or contact customer support for further information.

Best Regards,
KIREIZ SPACE Team
""",
        recipient_list=[user.email],
    )


    