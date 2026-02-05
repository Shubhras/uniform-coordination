# contracts/utils.py
import os
import requests
from django.core.mail import EmailMessage
from django.conf import settings
from contracts.docusign_auth import get_docusign_access_token
import base64
import os
import requests
from django.utils import timezone
from .models import DocuSignEnvelope
# from .docusign_auth import get_docusign_access_token
from collections import defaultdict


def send_final_pdf_to_user(envelope):
    """
    Downloads signed PDF from DocuSign and emails it to client
    """

    access_token = get_docusign_access_token()

    account_id = os.getenv("DOCUSIGN_ACCOUNT_ID")
    base_url = os.getenv("DOCUSIGN_BASE_URL")

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # Download signed document from DocuSign
    url = f"{base_url}/restapi/v2.1/accounts/{account_id}/envelopes/{envelope.envelope_id}/documents/1"

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        raise Exception("Failed to download signed PDF from DocuSign")

    #  Save PDF locally
    file_path = f"/tmp/signed_{envelope.envelope_id}.pdf"

    with open(file_path, "wb") as f:
        f.write(response.content)

    # Save into Django model
    with open(file_path, "rb") as f:
        envelope.signed_pdf.save(
            f"signed_{envelope.envelope_id}.pdf",
            f,
            save=True
        )

    quotation = envelope.quotation_request

    #Email to client
    email = EmailMessage(
        subject="Your Final Signed Agreement",
        body=f"""
Dear {quotation.contact_person},

Your quotation has been approved and signed.

Please find your final agreement attached.

Thank you
Sourabh's Venture  Capital
""",
        from_email=settings.EMAIL_HOST_USER,
        to=[quotation.email],
    )

    email.attach_file(file_path)
    email.send()

    return True



def send_docusign_envelope(quotation):
    """
    Sends a DocuSign envelope to the client for review & signature.
    Responsibility:
    - Call DocuSign
    - Return envelope_id
    - DO NOT touch DB
    """

    access_token = get_docusign_access_token()

    account_id = os.getenv("DOCUSIGN_ACCOUNT_ID")
    base_url = os.getenv("DOCUSIGN_BASE_URL")
    

    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # Render quotation content
    document_text = f"""
    QUOTATION AGREEMENT

    Client Name: {quotation.contact_person}
    Company Name: {quotation.company_name}
    Email: {quotation.email}
    Phone: {quotation.phone_number}

    Item Type: {quotation.item_type}
    Material: {quotation.material}
    Size & Quantity: {quotation.size_quantity}
    Delivery Date: {quotation.delivery_date}

    Additional Note:
    {quotation.additional_note}

    Quotation ID: {quotation.quotation_id}

    Please sign below to approve this quotation.

    Client Signature:
    **SIGN_HERE_CLIENT**




    Admin Approval:
    **SIGN_HERE_ADMIN**

    """

    envelope_payload = {
        "emailSubject": f"Quotation Agreement - {quotation.quotation_id}",

        #  DISABLE DOCUSIGN AUTO EMAILS
        "notification": {
            "useAccountDefaults": "false",
            "reminders": {
                "reminderEnabled": "false"
            },
            "expirations": {
                "expireEnabled": "false"
            }
        },

        "documents": [
            {
                "documentBase64": base64.b64encode(
                    document_text.encode("utf-8")
                ).decode("utf-8"),
                "name": "Quotation Agreement",
                "fileExtension": "txt",
                "documentId": "1"
            }
        ],
        "recipients": {
            "signers": [
                {
                    "email": quotation.email,
                    "name": quotation.contact_person,
                    "recipientId": "1",
                    "routingOrder": "1",
                    "tabs": {
                        "signHereTabs": [
                            {
                                "anchorString": "**SIGN_HERE_CLIENT**",
                                "anchorUnits": "pixels",
                                "anchorYOffset": "10",
                                "anchorXOffset": "20"
                            }
                        ]
                    }
                },
                {
                    "email": "sourabh.mori1digiprima@gmail.com",
                    "name": "Admin Approval",
                    "recipientId": "2",
                    "routingOrder": "2",
                    "tabs": {
                        "signHereTabs": [
                            {
                                "anchorString": "**SIGN_HERE_ADMIN**",
                                "anchorUnits": "pixels",
                                "anchorYOffset": "10",
                                "anchorXOffset": "20"
                            }
                        ]
                    }
                }
            ]
        }
        ,
        "status": "sent"
    }

    url = f"{base_url}/restapi/v2.1/accounts/{account_id}/envelopes"

    response = requests.post(url, headers=headers, json=envelope_payload)

    if response.status_code not in (200, 201):
        raise Exception(f"DocuSign send failed: {response.text}")

    data = response.json()
    envelope_id = data.get("envelopeId")

    if not envelope_id:
        raise Exception("DocuSign did not return envelopeId")

    return envelope_id
#----------------------------------------------------------

# contracts/docusign_service.py

# import base64
# import os
# import requests
# from contracts.docusign_auth import get_docusign_access_token
# from django.core.mail import EmailMessage
# from django.conf import settings


# # import os
# # import requests

# # from contracts.docusign_auth import get_docusign_access_token


# def send_final_pdf_to_user(envelope):
#     """
#     Downloads signed PDF from DocuSign and emails it to client
#     """

#     access_token = get_docusign_access_token()

#     account_id = os.getenv("DOCUSIGN_ACCOUNT_ID")
#     base_url = os.getenv("DOCUSIGN_BASE_URL")

#     headers = {"Authorization": f"Bearer {access_token}"}

#     url = f"{base_url}/restapi/v2.1/accounts/{account_id}/envelopes/{envelope.envelope_id}/documents/1"

#     response = requests.get(url, headers=headers)

#     if response.status_code != 200:
#         raise Exception("Failed to download signed PDF from DocuSign")

#     # Save PDF to model directly (no /tmp needed)
#     envelope.signed_pdf.save(
#         f"signed_{envelope.envelope_id}.pdf",
#         response.content,
#         save=True
#     )

#     quotation = envelope.quotation_request

#     email = EmailMessage(
#         subject="Your Final Signed Agreement",
#         body=f"""
# Dear {quotation.contact_person},

# Your quotation has been approved and signed.

# Please find your final agreement attached.

# Thank you,
# Sourabh's Venture Capital
# """,
#         from_email=settings.EMAIL_HOST_USER,
#         to=[quotation.email],
#     )

#     email.attach(
#         f"signed_{envelope.envelope_id}.pdf",
#         response.content,
#         "application/pdf"
#     )
#     email.send()

#     return True



# def _build_name(user):
#     return f"{user.firstName or ''} {user.lastName or ''}".strip()


# def send_rental_envelope(order, reserved_units, customer):
#     access_token = get_docusign_access_token()

#     account_id = os.getenv("DOCUSIGN_ACCOUNT_ID")
#     base_url = os.getenv("DOCUSIGN_BASE_URL")

#     headers = {
#         "Authorization": f"Bearer {access_token}",
#         "Content-Type": "application/json"
#     }

#     rfid_list = "\n".join([unit.rfid_code for unit in reserved_units])

#     document_text = f"""
#     RENTAL AGREEMENT

#     Order ID: {order.order_id}

#     Customer Name: {_build_name(customer)}
#     Email: {customer.email}

#     Rental Start Date: {order.start_date}
#     Rental End Date: {order.end_date}

#     Reserved RFID Units:
#     {rfid_list}

#     TERMS:
#     • Grace period: 3 days
#     • Late/Damage/Lost charges applicable

#     Client Signature:
#     **SIGN_HERE_CLIENT**

#     Admin Approval:
#     **SIGN_HERE_ADMIN**
#     """

#     payload = {
#         "emailSubject": f"Rental Agreement - {order.order_id}",
#         "documents": [{
#             "documentBase64": base64.b64encode(document_text.encode()).decode(),
#             "name": "Rental Agreement",
#             "fileExtension": "txt",
#             "documentId": "1"
#         }],
#         "recipients": {
#             "signers": [
#                 {
#                     "email": customer.email,
#                     "name": _build_name(customer),
#                     "recipientId": "1",
#                     "routingOrder": "1",
#                     "tabs": {
#                         "signHereTabs": [{
#                             "anchorString": "**SIGN_HERE_CLIENT**",
#                             "anchorUnits": "pixels",
#                             "anchorYOffset": "10",
#                             "anchorXOffset": "20"
#                         }]
#                     }
#                 },
#                 {
#                     "email": "sourabh.mori1digiprima@gmail.com",
#                     "name": "Admin Approval",
#                     "recipientId": "2",
#                     "routingOrder": "2",
#                     "tabs": {
#                         "signHereTabs": [{
#                             "anchorString": "**SIGN_HERE_ADMIN**",
#                             "anchorUnits": "pixels",
#                             "anchorYOffset": "10",
#                             "anchorXOffset": "20"
#                         }]
#                     }
#                 }
#             ]
#         },
#         "status": "sent"
#     }

#     url = f"{base_url}/restapi/v2.1/accounts/{account_id}/envelopes"
#     res = requests.post(url, headers=headers, json=payload)

#     if res.status_code not in (200, 201):
#         raise Exception(res.text)

#     return res.json()["envelopeId"]
