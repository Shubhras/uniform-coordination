import jwt
from django.conf import settings
from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
#from reportlab.lib.enums import TA_CENTER 
from reportlab.lib.enums import TA_RIGHT, TA_CENTER


# Agar aapko user aur product models access karna ho
#from userhub.models import CustomUpdateModel, Product, Parts


def generate_custom_tokens(user):
    """Generate custom access & refresh tokens for normal Users."""

    access_payload = {
        "user_id": user.id,
        "email": user.email,
        "type": "access",
        "exp": datetime.utcnow() + timedelta(minutes=60),
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
 
# from rest_framework.response import Response
# from rest_framework import status


# def success_response(message, data=None):
#     return Response(
#         {
#             "status": True,
#             "statusCode": 200,
#             "message": message,
#             "data": data,
#         },
#         status=status.HTTP_200_OK
#     )


# def error_response(message, status_code=400):
#     return Response(
#         {
#             "status": False,
#             "statusCode": status_code,
#             "message": message,
#             "data": None,
#         },
#         status=status.HTTP_400_BAD_REQUEST
#     )

# def generate_customization_pdf(obj, user):
#     file_name = f"customization_{obj.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
#     file_path = os.path.join(settings.MEDIA_ROOT, "exports", file_name)

#     os.makedirs(os.path.dirname(file_path), exist_ok=True)

#     doc = SimpleDocTemplate(file_path, pagesize=A4)
#     styles = getSampleStyleSheet()
#     elements = []

#     #  Title
#     elements.append(Paragraph("<b>Customization Export</b>", styles["Title"]))
#     elements.append(Spacer(1, 10))

#     # USER INFO
#     full_name = f"{user.firstName or ''} {user.lastName or ''}".strip()
#     elements.append(Paragraph(f"<b>Customization ID:</b> {obj.id}", styles["Normal"]))
#     elements.append(Paragraph(f"<b>User:</b> {full_name or user.email}", styles["Normal"]))
#     elements.append(Paragraph(f"<b>Email:</b> {user.email}", styles["Normal"]))
#     elements.append(Spacer(1, 15))

#     # PRODUCT INFO
#     product = obj.model_info.product
#     elements.append(Paragraph("<b>Product Details</b>", styles["Heading2"]))
#     elements.append(Paragraph(f"Name: {product.productName}", styles["Normal"]))
#     elements.append(Paragraph(f"Type: {product.productType}", styles["Normal"]))
#     elements.append(Paragraph(f"Price: {product.price}", styles["Normal"]))
#     elements.append(Spacer(1, 10))

#     # PARTS (ManyToMany)
#     parts = product.parts.filter(isDeleted=False, isActive=True)
#     elements.append(Paragraph("<b>Product Parts</b>", styles["Heading3"]))

#     if parts.exists():
#         parts_table = [["Part Name", "Category", "Fabric"]]
#         for part in parts:
#             parts_table.append([
#                 part.partName,
#                 part.category.title(),
#                 str(part.fabric)
#             ])

#         table = Table(parts_table, colWidths=[180, 120, 200])
#         table.setStyle(TableStyle([
#             ("BACKGROUND", (0, 0), (-1, 0), colors.darkgrey),
#             ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
#             ("GRID", (0, 0), (-1, -1), 1, colors.black),
#             ("FONT", (0, 0), (-1, 0), "Helvetica-Bold"),
#         ]))
#         elements.append(table)
#     else:
#         elements.append(Paragraph("No parts available", styles["Normal"]))

#     elements.append(Spacer(1, 15))

#     #  DESIGN SPECS
#     specs = obj.design_specifications or {}
#     if specs:
#         elements.append(Paragraph("<b>Design Specifications</b>", styles["Heading3"]))
#         spec_table = [["Specification", "Value"]]
#         for key, value in specs.items():
#             spec_table.append([
#                 key.replace("_", " ").title(),
#                 str(value)
#             ])

#         table = Table(spec_table, colWidths=[200, 300])
#         table.setStyle(TableStyle([
#             ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
#             ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
#             ("GRID", (0, 0), (-1, -1), 1, colors.black),
#             ("FONT", (0, 0), (-1, 0), "Helvetica-Bold"),
#         ]))
#         elements.append(table)

#     doc.build(elements)
#     return f"{settings.MEDIA_URL}exports/{file_name}"


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

    # 🔹 Custom Styles
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

    # TITLE
    elements.append(Paragraph("Customization Summary", title_style))

    # USER INFO BOX
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
            ["Price", f" {product.price}"],
        ],
        colWidths=[180, 300]
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

    # PRODUCT PARTS
    elements.append(Paragraph("Product Parts", section_style))
    parts = product.parts.filter(isDeleted=False, isActive=True)

    if parts.exists():
        parts_table = [["Part Name", "Category", "Fabric"]]

        for part in parts:
            parts_table.append([
                part.partName,
                part.category.title(),
                str(part.fabric)
            ])

        table = Table(parts_table, colWidths=[180, 140, 160])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2E4053")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("FONT", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
            ("ALIGN", (1, 1), (-1, -1), "CENTER"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
        ]))
        elements.append(table)
    else:
        elements.append(Paragraph("No parts available", normal_style))

    # DESIGN SPECIFICATIONS
    specs = obj.design_specifications or {}
    if specs:
        elements.append(Paragraph("Design Specifications", section_style))

        spec_table = [["Specification", "Value"]]
        for key, value in specs.items():
            spec_table.append([
                key.replace("_", " ").title(),
                str(value)
            ])

        table = Table(spec_table, colWidths=[220, 260])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#566573")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("FONT", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
        ]))
        elements.append(table)

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
        ["Quotation UUID", quotation.quotation_id],
        ["Company Name", quotation.company_name],
        ["Email", quotation.email],
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
