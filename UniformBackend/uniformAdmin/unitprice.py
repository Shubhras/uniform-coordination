from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import*
from rest_framework.permissions import IsAuthenticated ,BasePermission,AllowAny
from userhub.utils import *
import csv
import io
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from openpyxl import Workbook
from .models import Fabric, Parts
from drf_spectacular.utils import extend_schema,OpenApiExample,OpenApiResponse,OpenApiParameter,OpenApiTypes



class UnitPriceListAPIView(APIView):
     
    
    @extend_schema(
        tags=["Unit Price"],
        summary="Unit Price List",
        description=(
            "Fetch combined unit price list for Fabrics and Parts.\n\n"
            "- Fabric prices are shown\n"
            "- Part prices are returned as NULL\n"
        ),
        responses={
            200: OpenApiResponse(
                description="Unit price list fetched successfully",
                response=OpenApiTypes.OBJECT,
                examples=[
                    OpenApiExample(
                        "Success Response",
                        value={
                            "status": True,
                            "statusCode": 200,
                            "message": "Unit price list fetched successfully",
                            "data": [
                                {
                                    "type": "Fabric",
                                    "itemName": "Cotton",
                                    "unit": "Meter",
                                    "basePrice": 120,
                                    "bulk": 120,
                                    "action": "view",
                                },
                                {
                                    "type": "Part",
                                    "itemName": "Button",
                                    "unit": "Piece",
                                    "basePrice": None,
                                    "bulk": None,
                                    "action": "view",
                                },
                            ],
                        },
                    )
                ],
            ),
            500: OpenApiResponse(description="Internal server error"),
        },
        auth=[],  # Public API
    )
    
    def get(self, request):
        try:
            data = []

            # ================= FABRIC =================
            fabrics = Fabric.objects.filter(isDeleted=False, isActive=True)

            for fabric in fabrics:
                data.append({
                    "type": "Fabric",
                    "itemName": fabric.fabricName,
                    "unit": "Meter",
                    "basePrice": fabric.pricePerUnit or 0,
                    "bulk": fabric.pricePerUnit or 0,
                    "action": "view"
                })

            # ================= PARTS =================

            parts = Parts.objects.filter(isDeleted=False, isActive=True)
            for part in parts:
                data.append({
                    "type": "Part",
                    "itemName": part.partName,
                    "unit": "Piece",
                    "basePrice": None,  # <- set to null
                    "bulk": None,       # <- set to null
                    "action": "view"
                })

            serializer = UnitPriceSerializer(data, many=True)

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Unit price list fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class UnitPriceExportAPIView(APIView):
#     permission_classes = [AllowAny]

#     @extend_schema(
#         tags=["Unit Price"],
#         summary="Export Unit Price",
#         description=(
#             "Export unit price list.\n\n"
#             "**Query param `type`:**\n"
#             "- csv → CSV file\n"
#             "- excel → Excel (.xlsx)\n"
#             "- pdf → PDF file\n\n"
#             "**Note:** Response is a downloadable file."
#         ),
#         parameters=[
#             OpenApiParameter(
#                 name="type",
#                 description="Export file format",
#                 required=True,
#                 type=OpenApiTypes.STR,
#                 enum=["csv", "excel", "pdf"],
#             )
#         ],
#         responses={
#             200: OpenApiResponse(
#                 description="File downloaded successfully",
#                 response=OpenApiTypes.BINARY,  #  REQUIRED FIX
#             ),
#             400: OpenApiResponse(description="Invalid export type"),
#             500: OpenApiResponse(description="Internal server error"),
#         },
#         auth=[],  # public API
#     )
    
#     def get(self, request):
#         try:
#             export_type = request.query_params.get("type")

#             if export_type not in ["csv", "excel", "pdf"]:
#                 return HttpResponse(
#                     "Invalid type. Use csv, excel, or pdf.",
#                     status=status.HTTP_400_BAD_REQUEST,
#                 )

#             data = self.get_data()

#             if export_type == "csv":
#                 return self.export_csv(data)

#             if export_type == "excel":
#                 return self.export_excel(data)

#             if export_type == "pdf":
#                 return self.export_pdf(data)

#         except Exception as e:
#             return HttpResponse(
#                 f"Internal server error: {str(e)}",
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             )

#     # =====================================================
#     # COMBINED DATA
#     # =====================================================
#     def get_data(self):
#         rows = []

#         # ---------- FABRICS ----------
#         fabrics = Fabric.objects.filter(isDeleted=False, isActive=True)
#         for fabric in fabrics:
#             rows.append({
#                 "type": "Fabric",
#                 "itemName": fabric.fabricName,
#                 "unit": "Meter",
#                 "price": fabric.pricePerUnit,
#             })

#         # ---------- PARTS (PRICE = NULL) ----------
#         parts = Parts.objects.filter(isDeleted=False, isActive=True)
#         for part in parts:
#             rows.append({
#                 "type": "Part",
#                 "itemName": part.partName,
#                 "unit": "Piece",
#                 "price": None,   # IMPORTANT RULE
#             })

#         return rows

#     # =====================================================
#     # CSV EXPORT
#     # =====================================================

#     def export_csv(self, data):
#         response = HttpResponse(content_type="text/csv")
#         response["Content-Disposition"] = 'attachment; filename="unit_price.csv"'

#         writer = csv.writer(response)
#         writer.writerow(["Type", "Item Name", "Unit", "Base Price", "Bulk (10+)"])

#         for row in data:
#             writer.writerow([
#                 row["type"],
#                 row["itemName"],
#                 row["unit"],
#                 row["price"] if row["price"] is not None else "NULL",
#                 "NULL",             # Bulk (10+)
#             ])

#         return response



#     # =====================================================
#     # EXCEL EXPORT
#     # =====================================================

#     def export_excel(self, data):
#         wb = Workbook()
#         ws = wb.active
#         ws.title = "Unit Price"

#         ws.append(["Type", "Item Name", "Unit", "Base Price", "Bulk (10+)"])

#         for row in data:
#             ws.append([
#                 row["type"],
#                 row["itemName"],
#                 row["unit"],
#                 # row["price"],     # Base Price
#                 row["price"] if row["price"] is not None else "NULL",
#                 "NULL",             # Bulk (10+)
#             ])

#         response = HttpResponse(
#             content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
#         )
#         response["Content-Disposition"] = 'attachment; filename="unit_price.xlsx"'
#         wb.save(response)

#         return response



#     # =====================================================
#     # PDF EXPORT
#     # =====================================================

#     def export_pdf(self, data):
#         buffer = io.BytesIO()
#         p = canvas.Canvas(buffer, pagesize=A4)
#         width, height = A4

#         y = height - 40
#         p.setFont("Helvetica-Bold", 14)
#         p.drawString(40, y, "Unit Price List")

#         y -= 30
#         p.setFont("Helvetica-Bold", 10)

#         headers = ["Type", "Item Name", "Unit", "Base Price", "Bulk (10+)"]
#         x = [40, 110, 260, 340, 440]

#         for i, h in enumerate(headers):
#             p.drawString(x[i], y, h)

#         y -= 20
#         p.setFont("Helvetica", 10)

#         for row in data:
#             if y < 50:
#                 p.showPage()
#                 y = height - 40

#             p.drawString(40, y, row["type"])
#             p.drawString(110, y, row["itemName"])
#             p.drawString(260, y, row["unit"])
#             p.drawString(340, y, str(row["price"]) if row["price"] else "NULL")
#             p.drawString(440, y, "NULL")   # Bulk (10+)

#             y -= 18

#         p.save()
#         buffer.seek(0)

#         response = HttpResponse(buffer, content_type="application/pdf")
#         response["Content-Disposition"] = 'attachment; filename="unit_price.pdf"'

#         return response

class UnitPriceExportAPIView(APIView):
    # permission_classes = [AllowAny]

    def get(self, request):
        try:
            export_type = request.query_params.get("type")

            if export_type not in ["csv", "excel", "pdf"]:
                return HttpResponse(
                    "Invalid type. Use csv, excel, or pdf.",
                    status=status.HTTP_400_BAD_REQUEST,
                )

            data = self.get_data()

            if export_type == "csv":
                return self.export_csv(data)

            if export_type == "excel":
                return self.export_excel(data)

            if export_type == "pdf":
                return self.export_pdf(data)

        except Exception as e:
            return HttpResponse(
                f"Internal server error: {str(e)}",
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    # =====================================================
    # COMBINED DATA (FIXED)
    # =====================================================

    def get_data(self):
        rows = []

        # ---------- FABRICS ----------
        fabrics = Fabric.objects.filter(isDeleted=False, isActive=True)
        for fabric in fabrics:
            rows.append({
                "type": "Fabric",
                "itemName": fabric.fabricName,
                "unit": "Meter",
                "basePrice": fabric.pricePerUnit,
                "bulk": fabric.pricePerUnit
            })

        # ---------- PARTS ----------
        parts = Parts.objects.filter(isDeleted=False, isActive=True)
        for part in parts:
            rows.append({
                "type": "Part",
                "itemName": part.partName,
                "unit": "Piece",
                "basePrice": None,
                "bulk": None
            })

        return rows

    # =====================================================
    # CSV EXPORT
    # =====================================================

    def export_csv(self, data):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="unit_price.csv"'

        writer = csv.writer(response)
        writer.writerow(["Type", "Item Name", "Unit", "Base Price", "Bulk (10+)"])

        for row in data:
            writer.writerow([
                row["type"],
                row["itemName"],
                row["unit"],
                row["basePrice"] if row["basePrice"] is not None else "NULL",
                row["bulk"] if row["bulk"] is not None else "NULL",
            ])

        return response

    # =====================================================
    # EXCEL EXPORT
    # =====================================================

    def export_excel(self, data):
        wb = Workbook()
        ws = wb.active
        ws.title = "Unit Price"

        ws.append(["Type", "Item Name", "Unit", "Base Price", "Bulk (10+)"])

        for row in data:
            ws.append([
                row["type"],
                row["itemName"],
                row["unit"],
                row["basePrice"] if row["basePrice"] is not None else "NULL",
                row["bulk"] if row["bulk"] is not None else "NULL",
            ])

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="unit_price.xlsx"'
        wb.save(response)

        return response

    # =====================================================
    # PDF EXPORT
    # =====================================================

    def export_pdf(self, data):
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        y = height - 40
        p.setFont("Helvetica-Bold", 14)
        p.drawString(40, y, "Unit Price List")

        y -= 30
        p.setFont("Helvetica-Bold", 10)

        headers = ["Type", "Item Name", "Unit", "Base Price", "Bulk (10+)"]
        x = [40, 110, 260, 340, 440]

        for i, h in enumerate(headers):
            p.drawString(x[i], y, h)

        y -= 20
        p.setFont("Helvetica", 10)

        for row in data:
            if y < 50:
                p.showPage()
                y = height - 40

            p.drawString(40, y, row["type"])
            p.drawString(110, y, row["itemName"])
            p.drawString(260, y, row["unit"])
            p.drawString(
                340, y,
                str(row["basePrice"]) if row["basePrice"] is not None else "NULL"
            )
            p.drawString(
                440, y,
                str(row["bulk"]) if row["bulk"] is not None else "NULL"
            )

            y -= 18

        p.save()
        buffer.seek(0)

        response = HttpResponse(buffer, content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="unit_price.pdf"'

        return response