import jwt
from django.conf import settings
from datetime import datetime, timedelta

import os
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from django.conf import settings
from datetime import datetime

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



#================================================================


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



'''def generate_all_customizations_pdf(queryset, user):
    file_name = f"customizations_{user.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
    file_path = os.path.join(settings.MEDIA_ROOT, "exports", file_name)

    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    doc = SimpleDocTemplate(file_path, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    # 🔹 Title
    elements.append(Paragraph("<b>Custom Uniform Design Export</b>", styles["Title"]))
    elements.append(Spacer(1, 12))

    elements.append(Paragraph(f"<b>User:</b> {user}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Export Date:</b> {datetime.now().strftime('%d-%m-%Y')}", styles["Normal"]))
    elements.append(Spacer(1, 20))

    for index, obj in enumerate(queryset, start=1):
        elements.append(Paragraph(f"<b>Customization #{index}</b>", styles["Heading2"]))
        elements.append(Spacer(1, 10))

        elements.append(Paragraph(f"<b>Model:</b> {obj.model_info}", styles["Normal"]))
        elements.append(Spacer(1, 8))

        specs = obj.design_specifications or {}

        table_data = [["Specification", "Value"]]

        for key, value in specs.items():
            if isinstance(value, dict):
                value = ", ".join([f"{k}: {v}" for k, v in value.items()])
            table_data.append([
                key.replace("_", " ").title(),
                str(value)
            ])

        table = Table(table_data, colWidths=[200, 300])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("FONT", (0, 0), (-1, 0), "Helvetica-Bold"),
        ]))

        elements.append(table)

        if index < queryset.count():
            elements.append(PageBreak())

    doc.build(elements)

    return f"{settings.MEDIA_URL}exports/{file_name}"
    '''
def generate_customization_pdf(obj, user):
    file_name = f"customization_{obj.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
    file_path = os.path.join(settings.MEDIA_ROOT, "exports", file_name)

    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    doc = SimpleDocTemplate(file_path, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    #  Title
    elements.append(Paragraph("<b>Customization Export</b>", styles["Title"]))
    elements.append(Spacer(1, 10))

    #  USER INFO
    full_name = f"{user.firstName or ''} {user.lastName or ''}".strip()
    elements.append(Paragraph(f"<b>Customization ID:</b> {obj.id}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Email:</b> {user.email}", styles["Normal"]))
    elements.append(Spacer(1, 15))

    #  PRODUCT INFO
    product = obj.model_info.product
    elements.append(Paragraph("<b>Product Details</b>", styles["Heading2"]))
    elements.append(Paragraph(f"Name: {product.productName}", styles["Normal"]))
    elements.append(Paragraph(f"Type: {product.productType}", styles["Normal"]))
    elements.append(Paragraph(f"Price: {product.price}", styles["Normal"]))
    elements.append(Spacer(1, 10))

    #  PARTS (ManyToMany)
    parts = product.parts.filter(isDeleted=False, isActive=True)
    elements.append(Paragraph("<b>Product Parts</b>", styles["Heading3"]))

    if parts.exists():
        parts_table = [["Part Name", "Category", "Fabric"]]
        for part in parts:
            parts_table.append([
                part.partName,
                part.category.title(),
                str(part.fabric)
            ])

        table = Table(parts_table, colWidths=[180, 120, 200])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.darkgrey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("FONT", (0, 0), (-1, 0), "Helvetica-Bold"),
        ]))
        elements.append(table)
    else:
        elements.append(Paragraph("No parts available", styles["Normal"]))

    elements.append(Spacer(1, 15))

    # 🔹 DESIGN SPECS
    specs = obj.design_specifications or {}
    if specs:
        elements.append(Paragraph("<b>Design Specifications</b>", styles["Heading3"]))
        spec_table = [["Specification", "Value"]]
        for key, value in specs.items():
            spec_table.append([
                key.replace("_", " ").title(),
                str(value)
            ])

        table = Table(spec_table, colWidths=[200, 300])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("FONT", (0, 0), (-1, 0), "Helvetica-Bold"),
        ]))
        elements.append(table)

    doc.build(elements)
    return f"{settings.MEDIA_URL}exports/{file_name}"

def generate_quotation_pdf(obj, request):
    file_name = f"quotation_{obj.uuids}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
    file_path = os.path.join(settings.MEDIA_ROOT, "exports", file_name)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    doc = SimpleDocTemplate(file_path, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    #  TITLE
    elements.append(Paragraph("<b>Quotation Request Export</b>", styles["Title"]))
    elements.append(Spacer(1, 12))

    #  QUOTATION INFO
    elements.append(Paragraph(f"<b>Quotation ID:</b> {obj.uuids}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Company:</b> {obj.company_name}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Contact Person:</b> {obj.contact_person}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Email:</b> {obj.email}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Phone Number:</b> {obj.phone_number}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Created At:</b> {obj.created_at}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Updated At:</b> {obj.updated_at}", styles["Normal"]))
    elements.append(Spacer(1, 12))

    #  UNIFORM / ITEM DETAILS
    elements.append(Paragraph("<b>Item Details</b>", styles["Heading2"]))
    elements.append(Paragraph(f"Item Type: {obj.item_type}", styles["Normal"]))
    elements.append(Paragraph(f"Material: {obj.material}", styles["Normal"]))
    elements.append(Paragraph(f"Size / Quantity: {obj.size_quantity}", styles["Normal"]))
    elements.append(Paragraph(f"Delivery Date: {obj.delivery_date}", styles["Normal"]))
    elements.append(Paragraph(f"Additional Note: {obj.additional_note}", styles["Normal"]))
    elements.append(Spacer(1, 12))

    # 🔹 CUSTOM UPDATE / DESIGN SPECS
    if obj.customupdatemodel:
        custom = obj.customupdatemodel

        # Design Specifications
        specs = custom.design_specifications or {}
        if specs:
            elements.append(Paragraph("<b>Design Specifications</b>", styles["Heading3"]))
            spec_table = [["Specification", "Value"]]
            for key, value in specs.items():
                spec_table.append([key.replace("_", " ").title(), str(value)])

            table = Table(spec_table, colWidths=[200, 300])
            table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ("FONT", (0, 0), (-1, 0), "Helvetica-Bold"),
            ]))
            elements.append(table)
            elements.append(Spacer(1, 12))

        # Product Info
        if custom.model_info and custom.model_info.product:
            product = custom.model_info.product
            elements.append(Paragraph("<b>Product Details</b>", styles["Heading2"]))
            elements.append(Paragraph(f"Name: {product.productName}", styles["Normal"]))
            elements.append(Paragraph(f"Type: {product.productType}", styles["Normal"]))
            elements.append(Paragraph(f"Price: {product.price}", styles["Normal"]))
            elements.append(Spacer(1, 10))

            # Parts Table
            parts = product.parts.filter(isDeleted=False, isActive=True)
            elements.append(Paragraph("<b>Product Parts</b>", styles["Heading3"]))
            if parts.exists():
                parts_table = [["Part Name", "Category", "Fabric"]]
                for part in parts:
                    parts_table.append([
                        part.partName,
                        str(part.category),
                        str(part.fabric)
                    ])
                table = Table(parts_table, colWidths=[180, 120, 200])
                table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.darkgrey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ("FONT", (0, 0), (-1, 0), "Helvetica-Bold"),
                ]))
                elements.append(table)
            else:
                elements.append(Paragraph("No parts available", styles["Normal"]))
            elements.append(Spacer(1, 12))

    #  BUILD PDF
    doc.build(elements)

    return f"{settings.MEDIA_URL}exports/{file_name}"
