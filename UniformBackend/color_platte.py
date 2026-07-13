import os
import sys
import django

sys.path.append(os.path.abspath("."))
# Django settings setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "UniformWeb.settings")  
django.setup()

from uniformAdmin.models import Colors, Fabric

fabric_ids = list(Fabric.objects.values_list("id", flat=True))

# Colors data 
colors_data = [
    {"colorName": "Navy Blue", "colorCode": "#003562"},
    {"colorName": "Ivory", "colorCode": "#FFFAE5"},
    {"colorName": "Burgundy", "colorCode": "#800020"},
    {"colorName": "Black", "colorCode": "#000000"},
    {"colorName": "DarkCyan", "colorCode": "#008B8B"},
    {"colorName": "Cyan", "colorCode": "#00FFFF"},
    {"colorName": "DarkGoldenRod", "colorCode": "#B8860B"},
    {"colorName": "Cornsilk", "colorCode": "#FFF8DC"},
]

for color in colors_data:
    obj, created = Colors.objects.get_or_create(
        colorName=color["colorName"],
        defaults={
            "colorCode": color["colorCode"],
            "isActive": True,
            "isDeleted": False
        }
    )

    # Compatible fabrics assign karna
    if fabric_ids:
        obj.compatibleFabric.set(fabric_ids)

    print(f"Saved: {obj.colorName}")

print("All colors seeded successfully!")
