# import requests
# import sys

# # ================= CONFIG =================

# BASE_URL = "http://127.0.0.1:8000/api/v1/uniformAdmin"

# TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcxMTU2Mjk5LCJpYXQiOjE3Njg1NjQyOTksImp0aSI6ImZlMTc3YTYxMDlmOTQ4MDE4Y2VmNzUxNWZlNTEwMjlkIiwidXNlcl9pZCI6MSwicm9sZSI6ImFkbWluIn0.lJJZwtjbVt7ct5bXxNOl72kL36nCtoki19dzzdnrqSc"

# HEADERS = {
#     "Authorization": f"Bearer {TOKEN}",
#     "Content-Type": "application/json"
# }

# DATA = [
#     {
#         "category": {
#             "categoryName": "School Uniform",
#             "type": "uniform",
#             "description": "All types of school uniforms"
#         },
#         "subcategories": [
#             {"name": "Boys Uniform"},
#             {"name": "Girls Uniform"},
#             {"name": "Sports Uniform"},
#             {"name": "Winter Uniform"},
#             {"name": "Summer Uniform"},
#             {"name": "Accessories"}
#         ]
#     },
#     {
#         "category": {
#             "categoryName": "Office Furniture",
#             "type": "table",
#             "description": "Furniture for office spaces"
#         },
#         "subcategories": [
#             {"name": "Office Table"},
#             {"name": "Conference Table"},
#             {"name": "Chairs"},
#             {"name": "Cabinets"},
#             {"name": "Bookshelves"},
#             {"name": "Partitions"}
#         ]
#     },
#     {
#         "category": {
#             "categoryName": "Sports Equipment",
#             "type": "uniform",
#             "description": "All sports-related equipment"
#         },
#         "subcategories": [
#             {"name": "Football"},
#             {"name": "Cricket"},
#             {"name": "Basketball"},
#             {"name": "Tennis"},
#             {"name": "Badminton"},
#             {"name": "Gym Equipment"}
#         ]
#     },
#     {
#         "category": {
#             "categoryName": "Laboratory Supplies",
#             "type": "table",
#             "description": "Equipment and supplies for labs"
#         },
#         "subcategories": [
#             {"name": "Glassware"},
#             {"name": "Chemicals"},
#             {"name": "Microscopes"},
#             {"name": "Lab Furniture"},
#             {"name": "Protective Gear"},
#             {"name": "Instruments"}
#         ]
#     },
#     {
#         "category": {
#             "categoryName": "Classroom Materials",
#             "type": "uniform",
#             "description": "Materials used in classrooms"
#         },
#         "subcategories": [
#             {"name": "Books"},
#             {"name": "Notebooks"},
#             {"name": "Stationery"},
#             {"name": "Charts & Posters"},
#             {"name": "Project Materials"},
#             {"name": "Teaching Aids"}
#         ]
#     }
# ]

# # ================= HELPERS =================

# def normalize(value: str) -> str:
#     """Normalize strings for safe comparison"""
#     return value.strip().lower()


# def safe_request(method, url, **kwargs):
#     try:
#         response = requests.request(method, url, timeout=10, **kwargs)

#         if response.status_code == 401:
#             print("❌ 401 Unauthorized → Invalid / expired JWT token")
#             sys.exit(1)

#         if response.status_code >= 500:
#             print("❌ Server error:", response.text)
#             sys.exit(1)

#         if not response.text.strip():
#             print("❌ Empty response from server")
#             sys.exit(1)

#         try:
#             return response.json()
#         except ValueError:
#             print("❌ Non-JSON response received:")
#             print(response.text)
#             sys.exit(1)

#     except requests.exceptions.ConnectionError:
#         print("❌ Cannot connect to server. Is runserver running?")
#         sys.exit(1)


# # ================= CATEGORY =================

# def create_category(payload):
#     return safe_request(
#         "POST",
#         f"{BASE_URL}/categories/create/",
#         json=payload,
#         headers=HEADERS
#     )


# def get_category_id_by_name(name):
#     res = safe_request(
#         "GET",
#         f"{BASE_URL}/categories/list/?search={name}",
#         headers=HEADERS
#     )

#     for item in res.get("data", []):
#         if normalize(item.get("categoryName", "")) == normalize(name):
#             return item.get("id")
#     return None


# # ================= SUBCATEGORY =================

# def create_subcategory(payload):
#     return safe_request(
#         "POST",
#         f"{BASE_URL}/subcategory/create/",
#         json=payload,
#         headers=HEADERS
#     )


# def get_existing_subcategory_names(category_id):
#     res = safe_request(
#         "GET",
#         f"{BASE_URL}/subcategory/list/?category={category_id}",
#         headers=HEADERS
#     )

#     existing = set()

#     for item in res.get("data", []):
#         name = item.get("name") or item.get("subcategoryName")
#         if name:
#             existing.add(normalize(name))

#     return existing


# # ================= RUN SCRIPT =================

# for item in DATA:
#     category_payload = item["category"]
#     category_name = category_payload["categoryName"]

#     print(f"\n🔹 Processing category: {category_name}")

#     category_id = get_category_id_by_name(category_name)

#     if category_id:
#         print("→ Category already exists, skipping creation")
#     else:
#         response = create_category(category_payload)
#         print("→", response.get("message"))
#         category_id = get_category_id_by_name(category_name)

#     if not category_id:
#         print("❌ Category ID not found, skipping subcategories")
#         continue

#     existing_subcategories = get_existing_subcategory_names(category_id)

#     for sub in item["subcategories"]:
#         sub_name = sub["name"]

#         if normalize(sub_name) in existing_subcategories:
#             print(f"   ✔ {sub_name} already exists, skipping")
#             continue

#         sub_payload = {
#             "name": sub_name.strip(),
#             "category": category_id,
#             "type": category_payload.get("type", "uniform")
#         }

#         response = create_subcategory(sub_payload)
#         message = response.get("message", "").lower()

#         if "already" in message or "exist" in message:
#             print(f"   ✔ {sub_name} already exists , skipping")
#         else:
#             print(f"   ➕ {sub_name} → {response.get('message')}")


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
        print("❌ Invalid or expired token")
        sys.exit(1)

    try:
        return response.json()
    except Exception:
        print("❌ Non JSON response:", response.text)
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
        print("❌ Failed to fetch category ID")
        continue

    for sub in block["subcategories"]:
        print(f"   ➕ Subcategory: {sub['name']}")

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
