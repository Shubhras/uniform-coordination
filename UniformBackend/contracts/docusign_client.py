# from docusign_esign import ApiClient, EnvelopesApi, EnvelopeDefinition, Document, Signer, SignHere, Recipients
# from contracts.docusign_auth import get_docusign_access_token
# import base64

# # === DocuSign Client Setup ===
# def get_docusign_api_client():
#     access_token = get_docusign_access_token()
#     api_client = ApiClient()
#     api_client.host = "https://demo.docusign.net/restapi"  # sandbox
#     api_client.set_default_header("Authorization", f"Bearer {access_token}")
#     return api_client

# # === Send Quotation for Signature ===
# def send_quotation_for_signature(email, name, pdf_file_path, quotation_id):
#     """
#     Sends a PDF to a recipient for signing.
#     """
#     api_client = get_docusign_api_client()
#     envelopes_api = EnvelopesApi(api_client)

#     # Read PDF and convert to base64
#     with open(pdf_file_path, "rb") as f:
#         pdf_bytes = f.read()
#         encoded_pdf = base64.b64encode(pdf_bytes).decode("utf-8")

#     # Create envelope document
#     doc = Document(
#         document_base64=encoded_pdf,
#         name=f"Quotation {quotation_id}",
#         file_extension="pdf",
#         document_id="1"
#     )

#     # Create signer
#     signer = Signer(
#         email=email,
#         name=name,
#         recipient_id="1",
#         routing_order="1"
#     )

#     # SignHere tab (signature field) at first page, position x=100, y=150
#     sign_here = SignHere(
#         document_id="1",
#         page_number="1",
#         x_position="100",
#         y_position="150"
#     )

#     signer.tabs = {"sign_here_tabs": [sign_here]}
#     recipients = Recipients(signers=[signer])

#     # Create envelope
#     envelope_definition = EnvelopeDefinition(
#         email_subject=f"Please sign your Quotation: {quotation_id}",
#         documents=[doc],
#         recipients=recipients,
#         status="sent"  # "sent" means immediately sent to signer
#     )

#     # Send envelope
#     envelope_summary = envelopes_api.create_envelope(
#         account_id="YOUR_ACCOUNT_ID_HERE",  # replace with your sandbox account ID
#         envelope_definition=envelope_definition
#     )

#     return envelope_summary



#===================================================================


import os
import base64
from docusign_esign import (ApiClient,EnvelopesApi,
    EnvelopeDefinition,
    Document,
    Signer,
    SignHere,
    Tabs,
    Recipients
)

# =========================
# ENV
# =========================
DOCUSIGN_ACCOUNT_ID = os.getenv("DOCUSIGN_ACCOUNT_ID")
DOCUSIGN_BASE_URL = os.getenv("DOCUSIGN_BASE_URL")

from contracts.docusign_auth import get_docusign_access_token


# =========================
# API CLIENT
# =========================
def get_docusign_api_client():
    access_token = get_docusign_access_token()

    api_client = ApiClient()
    api_client.host = DOCUSIGN_BASE_URL + "/restapi"
    api_client.set_default_header("Authorization", f"Bearer {access_token}")

    return api_client


# =========================
# SEND QUOTATION
# =========================
# def send_quotation_for_signature(email, name, pdf_file_path, quotation_id):
#     api_client = get_docusign_api_client()
#     envelopes_api = EnvelopesApi(api_client)

#     # Load PDF
#     with open(pdf_file_path, "rb") as f:
#         pdf_bytes = f.read()

#     document = Document(
#         document_base64=base64.b64encode(pdf_bytes).decode("utf-8"),
#         name=f"Quotation {quotation_id}",
#         file_extension="pdf",
#         document_id="1"
#     )

#     signer = Signer(
#         email=email,
#         name=name,
#         recipient_id="1",
#         routing_order="1"
#     )

#     sign_here = SignHere(
#         document_id="1",
#         page_number="1",
#         recipient_id="1",
#         x_position="400",
#         y_position="700"
#     )

#     tabs = Tabs(sign_here_tabs=[sign_here])
#     signer.tabs = tabs

#     recipients = Recipients(signers=[signer])

#     envelope = EnvelopeDefinition(
#         email_subject=f"Please sign your quotation {quotation_id}",
#         documents=[document],
#         recipients=recipients,
#         status="sent"
#     )

#     result = envelopes_api.create_envelope(
#         account_id=DOCUSIGN_ACCOUNT_ID,
#         envelope_definition=envelope
#     )

#     return result
