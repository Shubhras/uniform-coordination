import os
import json
import uuid
from django.conf import settings

def save_large_json_to_file(json_data):
 


    folder_path = os.path.join(settings.MEDIA_ROOT, "custom_json")
    os.makedirs(folder_path, exist_ok=True)
    filename = f"{uuid.uuid4()}.json"
    full_path = os.path.join(folder_path, filename)
    with open(full_path, "w", encoding="utf-8") as file:
        json.dump(json_data, file)

    return f"custom_json/{filename}"
