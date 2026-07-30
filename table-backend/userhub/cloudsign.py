import base64
import logging
import uuid
import requests
from django.conf import settings
from decimal import Decimal

logger = logging.getLogger(__name__)

def is_mock_configured():
    client_id = getattr(settings, "CLOUDSIGN_CLIENT_ID", "mock-client-id")
    client_secret = getattr(settings, "CLOUDSIGN_CLIENT_SECRET", "mock-client-secret")
    return "mock" in client_id.lower() or "mock" in client_secret.lower()

def get_cloudsign_token():
    """
    Get access token from CloudSign API.
    """
    if is_mock_configured():
        return "mock-access-token"

    client_id = getattr(settings, "CLOUDSIGN_CLIENT_ID", "")
    client_secret = getattr(settings, "CLOUDSIGN_CLIENT_SECRET", "")
    base_url = getattr(settings, "CLOUDSIGN_BASE_URL", "https://sandbox.cloudsign.jp")

    url = f"{base_url}/v1/token"
    payload = {
        "client_id": client_id,
        "client_secret": client_secret
    }
    response = requests.post(url, json=payload)
    response.raise_for_status()
    return response.json().get("access_token")

def send_cloudsign_contract(quotation, pdf_path):
    """
    Create, attach file, add participant, and send document via CloudSign.
    """
    if is_mock_configured():
        mock_doc_id = f"CS-{uuid.uuid4().hex[:12].upper()}"
        logger.info(f"[CloudSign Mock] Created and sent contract for quotation {quotation.quotation_id}. ID: {mock_doc_id}")
        return mock_doc_id

    base_url = getattr(settings, "CLOUDSIGN_BASE_URL", "https://sandbox.cloudsign.jp")
    token = get_cloudsign_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Step 1: Create Document
    doc_url = f"{base_url}/v1/documents"
    doc_payload = {
        "title": f"Rental Agreement - {quotation.quotation_id}",
        "note": "Please sign the rental agreement for KIREIZ SPACE."
    }
    doc_resp = requests.post(doc_url, json=doc_payload, headers=headers)
    doc_resp.raise_for_status()
    document_id = doc_resp.json().get("id")

    # Step 2: Upload PDF File
    file_url = f"{base_url}/v1/documents/{document_id}/files"
    with open(pdf_path, "rb") as f:
        files = {
            "file": (f"Agreement_{quotation.quotation_id}.pdf", f, "application/pdf")
        }
        # For multipart, we need headers without Content-Type (requests sets it automatically)
        multipart_headers = {
            "Authorization": f"Bearer {token}"
        }
        file_resp = requests.post(file_url, files=files, headers=multipart_headers)
        file_resp.raise_for_status()

    # Step 3: Add Participant
    part_url = f"{base_url}/v1/documents/{document_id}/participants"
    part_payload = {
        "email": quotation.email,
        "name": quotation.contact_person or "Client",
        "order": 1
    }
    part_resp = requests.post(part_url, json=part_payload, headers=headers)
    part_resp.raise_for_status()

    # Step 4: Send the Document
    send_url = f"{base_url}/v1/documents/{document_id}/send"
    send_resp = requests.post(send_url, headers=headers)
    send_resp.raise_for_status()

    return document_id

def download_signed_pdf(document_id):
    """
    Download signed PDF from CloudSign. Returns PDF bytes.
    """
    if is_mock_configured():
        # Return a simple mock PDF byte string
        return b"%PDF-1.4 Mock Signed Document By CloudSign"

    base_url = getattr(settings, "CLOUDSIGN_BASE_URL", "https://sandbox.cloudsign.jp")
    token = get_cloudsign_token()
    headers = {
        "Authorization": f"Bearer {token}"
    }
    url = f"{base_url}/v1/documents/{document_id}/files"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    # Find the signed file URL or file payload and download it
    # Depending on CloudSign API, it might return a file list or the binary directly
    # Here we assume it returns the binary file content of the combined signed PDF
    return response.content
