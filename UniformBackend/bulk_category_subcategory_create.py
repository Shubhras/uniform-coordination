
#=============================================================================


import requests
import os
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1/uniformAdmin"

# TOKEN = "YOUR_JWT_TOKEN_HERE"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcxMTU2Mjk5LCJpYXQiOjE3Njg1NjQyOTksImp0aSI6ImZlMTc3YTYxMDlmOTQ4MDE4Y2VmNzUxNWZlNTEwMjlkIiwidXNlcl9pZCI6MSwicm9sZSI6ImFkbWluIn0.lJJZwtjbVt7ct5bXxNOl72kL36nCtoki19dzzdnrqSc"


HEADERS = {
    "Authorization": f"Bearer {TOKEN}"
}

IMG_BASE = "/home/dell/Downloads"

# ================= SAFE REQUEST =================

def safe_request(method, url, **kwargs):
    response = requests.request(method, url, timeout=15, **kwargs)

    if response.status_code == 401:
        print("Invalid or expired token")
        sys.exit(1)

    try:
        return response.json()
    except Exception:
        print("Non JSON response:", response.text)
        sys.exit(1)

# ================= CATEGORY =================

def create_category(payload, image_path):
    files = {}
    if image_path and os.path.exists(image_path):
        files["categoryImage"] = open(image_path, "rb")

    return safe_request(
        "POST",
        f"{BASE_URL}/categories/create/",
        headers=HEADERS,
        data=payload,
        files=files
    )

def get_category_id(name):
    res = safe_request(
        "GET",
        f"{BASE_URL}/categories/list/?search={name}",
        headers=HEADERS
    )
    for item in res.get("data", []):
        if item["categoryName"].lower() == name.lower():
            return item["id"]
    return None

# ================= SUBCATEGORY =================

def create_subcategory(payload, image_path):
    files = {}
    if image_path and os.path.exists(image_path):
        files["subcategoryImage"] = open(image_path, "rb")

    return safe_request(
        "POST",
        f"{BASE_URL}/subcategory/create/",
        headers=HEADERS,
        data=payload,
        files=files
    )

# ================= DATA =================

DATA = [
    {
        "category": {
            "categoryName": "Paradise",
            "type": "table",
            "description": "Creative visuals",
            "image": "sun.jpg"
        },
        "subcategories": [
            {
                "name": "Comose",
                "description": "Galaxy inspired designs",
                "image": "galaxy.jpg"
            },
            {
                "name": "Solar system",
                "description": "Sun based concepts",
                "image": "sun.jpg"
            },
            {
                "name": "Wild image",
                "description": "Leadership symbolism",
                "image": "Lion.jpg"
            },
            {
                "name": "Natural Visionary",
                "description": "Natural creativity",
                "image": "natural_place.jpg"
            },
            {
                "name": "Groupisum Thinking",
                "description": "Brainstorming visuals",
                "image": "group_discussion.jpg"
            },
            {
                "name": "Corporate culture",
                "description": "Business creativity",
                "image": "corporate_man.jpg"
            }
        ]
    }
]

# ================= RUN =================

for block in DATA:
    cat = block["category"]

    print(f"\n🔹 Category: {cat['categoryName']}")

    category_id = get_category_id(cat["categoryName"])

    if not category_id:
        response = create_category(
            payload={
                "categoryName": cat["categoryName"],
                "type": cat["type"],
                "description": cat["description"]
            },
            image_path=f"{IMG_BASE}/{cat['image']}"
        )
        print("→", response.get("message"))
        category_id = get_category_id(cat["categoryName"])
    else:
        print("→ Category already exists")

    if not category_id:
        print("Failed to fetch category ID")
        continue

    for sub in block["subcategories"]:
        print(f" Subcategory: {sub['name']}")

        response = create_subcategory(
            payload={
                "name": sub["name"],
                "category": category_id,
                "description": sub["description"],
                "isActive": True,
                "type": cat["type"]
            },
            image_path=f"{IMG_BASE}/{sub['image']}"
        )

        print("     ✔", response.get("message"))
