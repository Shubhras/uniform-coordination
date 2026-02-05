# rental/docusign.py
# import base64
# import os
# import requests
# from contracts.docusign_auth import get_docusign_access_token
# from django.conf import settings
# from docusign_esign import EnvelopesApi, EnvelopeDefinition, Document, Signer, SignHere, Tabs


# def update_docusign_charges(order):
#     """
#     This function is called when items are returned.
#     It sends updated return/charge summary to DocuSign.
#     """

#     # -------------------------------
#     # Build Return Summary Table
#     # -------------------------------
#     rows = ""
#     total_lost = 0
#     total_damage = 0

#     for item in order.items.all():
#         pending_qty = item.quantity - item.returned_quantity

#         total_lost += item.lost_charge or 0
#         total_damage += item.damage_charge or 0

#         rows += f"""
#         <tr>
#             <td>{item.product.productName}</td>
#             <td>{item.quantity}</td>
#             <td>{item.returned_quantity}</td>
#             <td>{pending_qty}</td>
#             <td>{item.condition}</td>
#             <td>₹{(item.lost_charge or 0) + (item.damage_charge or 0)}</td>
#         </tr>
#         """

#     html = f"""
#     <html>
#     <body>
#         <h2>Rental Return Summary</h2>

#         <table border="1" cellpadding="8" cellspacing="0">
#             <tr>
#                 <th>Product</th>
#                 <th>Ordered Qty</th>
#                 <th>Returned Qty</th>
#                 <th>Pending Qty</th>
#                 <th>Condition</th>
#                 <th>Charges</th>
#             </tr>
#             {rows}
#         </table>

#         <br><br>
#         <h3>Total Lost Charges: ₹{total_lost}</h3>
#         <h3>Total Damage Charges: ₹{total_damage}</h3>
#         <h3>Grand Total Charges: ₹{total_lost + total_damage}</h3>

#         <br><br>
#         <p>Please review the above charges and sign.</p>

#         <p><strong>Customer Signature:</strong></p>
#         <div style="margin-top:80px;">__________________________</div>

#     </body>
#     </html>
#     """

#     # -------------------------------
#     # Convert HTML to base64 document
#     # -------------------------------
#     document = Document(
#         document_base64=base64.b64encode(html.encode("utf-8")).decode("utf-8"),
#         name="Rental Return Charges",
#         file_extension="html",
#         document_id="1",
#     )

#     # -------------------------------
#     # Signer
#     # -------------------------------
#     signer = Signer(
#         email=order.user.email,
#         name=order.user.get_full_name() or order.user.email,
#         recipient_id="1",
#         routing_order="1",
#     )

#     sign_here = SignHere(
#         anchor_string="Customer Signature:",
#         anchor_units="pixels",
#         anchor_x_offset="0",
#         anchor_y_offset="20",
#     )

#     signer.tabs = Tabs(sign_here_tabs=[sign_here])

#     # -------------------------------
#     # Envelope
#     # -------------------------------
#     envelope_definition = EnvelopeDefinition(
#         email_subject="Rental Return Charges - Please Sign",
#         documents=[document],
#         recipients={"signers": [signer]},
#         status="sent",
#     )

#     # -------------------------------
#     # Send Envelope
#     # -------------------------------
#     api_client = settings.DOCUSIGN_API_CLIENT
#     envelopes_api = EnvelopesApi(api_client)

#     envelopes_api.create_envelope(
#         account_id=settings.DOCUSIGN_ACCOUNT_ID,
#         envelope_definition=envelope_definition,
#     )


#----------------------------------------------------------------
#priviouslly working file

#rental/docusign.py
# import base64
# import os
# import requests
# from contracts.docusign_auth import get_docusign_access_token


# # ---------------------------------------------------------
# # Helper functions for your custom Users model
# # ---------------------------------------------------------

# def get_customer_name(order):
#     user = order.user
#     first = user.firstName or ""
#     last = user.lastName or ""
#     name = f"{first} {last}".strip()
#     return name if name else user.email


# def get_customer_email(order):
#     return order.user.email


# # ---------------------------------------------------------
# # 1️⃣ SEND RENTAL AGREEMENT WHEN ORDER IS CREATED
# # ---------------------------------------------------------

# def send_rental_docusign_envelope(order):
#     access_token = get_docusign_access_token()

#     account_id = os.getenv("DOCUSIGN_ACCOUNT_ID")
#     base_url = os.getenv("DOCUSIGN_BASE_URL")

#     headers = {
#         "Authorization": f"Bearer {access_token}",
#         "Content-Type": "application/json"
#     }

#     customer_name = get_customer_name(order)
#     customer_email = get_customer_email(order)

#     items_text = ""
#     for item in order.items.all():
#         items_text += (
#             f"\nProduct: {item.product.productName}"
#             f"\nQuantity: {item.quantity}"
#             f"\nRental Price/Day: ₹{item.product.rental_price_per_day}\n"
#         )

#     document_text = f"""
#     RENTAL AGREEMENT

#     Order ID: {order.order_id}

#     Customer Name: {customer_name}
#     Email: {customer_email}

#     Rental Start Date: {order.start_date}
#     Rental End Date: {order.return_date}

#     ITEMS:
#     {items_text}

#     TERMS:

#     • Rental price is charged per item per day.
#     • Grace period: 3 days after end date.
#     • Late fee applies from 4th day.
#     • Lost/Damaged items charged at lost price.
#     • Items must be returned in original condition.

#     Client Signature:
#     **SIGN_HERE_CLIENT**

#     Admin Approval:
#     **SIGN_HERE_ADMIN**
#     """

#     payload = {
#         "emailSubject": f"Rental Agreement - {order.order_id}",
#         "documents": [
#             {
#                 "documentBase64": base64.b64encode(
#                     document_text.encode("utf-8")
#                 ).decode("utf-8"),
#                 "name": "Rental Agreement",
#                 "fileExtension": "txt",
#                 "documentId": "1"
#             }
#         ],
#         "recipients": {
#             "signers": [
#                 {
#                     "email": customer_email,
#                     "name": customer_name,
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

#     response = requests.post(url, headers=headers, json=payload)

#     if response.status_code not in (200, 201):
#         raise Exception(response.text)

#     return response.json().get("envelopeId")


# # ---------------------------------------------------------
# # 2️⃣ UPDATE DOCUSIGN WHEN ITEMS ARE RETURNED
# # ---------------------------------------------------------

# # def update_docusign_charges(order):
# #     """
# #     Sends a DocuSign envelope for rental return charges.
# #     This triggers every time an item is returned, even partial.
# #     Includes all items in the order with returned/pending/lost/damage info.
# #     """
# #     access_token = get_docusign_access_token()
# #     account_id = os.getenv("DOCUSIGN_ACCOUNT_ID")
# #     base_url = os.getenv("DOCUSIGN_BASE_URL")

# #     headers = {
# #         "Authorization": f"Bearer {access_token}",
# #         "Content-Type": "application/json",
# #     }

# #     rows = ""
# #     total_lost = 0
# #     total_damage = 0

# #     for item in order.items.all():
# #         pending_qty = item.quantity - item.returned_quantity
# #         lost = float(item.lost_charge or 0)
# #         damage = float(item.damage_charge or 0)
# #         total_lost += lost
# #         total_damage += damage

# #         rows += f"""
# #         <tr>
# #             <td>{item.product.productName}</td>
# #             <td>{item.quantity}</td>
# #             <td>{item.returned_quantity}</td>
# #             <td>{pending_qty}</td>
# #             <td>{item.condition or 'N/A'}</td>
# #             <td>₹{lost + damage}</td>
# #         </tr>
# #         """

# #     html = f"""
# #     <html>
# #     <body>
# #         <h2>Rental Return Summary</h2>

# #         <table border="1" cellpadding="8" cellspacing="0">
# #             <tr>
# #                 <th>Product</th>
# #                 <th>Ordered Qty</th>
# #                 <th>Returned Qty</th>
# #                 <th>Pending Qty</th>
# #                 <th>Condition</th>
# #                 <th>Charges</th>
# #             </tr>
# #             {rows}
# #         </table>

# #         <br><br>
# #         <h3>Total Lost Charges: ₹{total_lost}</h3>
# #         <h3>Total Damage Charges: ₹{total_damage}</h3>
# #         <h3>Grand Total Charges: ₹{total_lost + total_damage}</h3>

# #         <br><br>
# #         <p>Please review the above charges and sign.</p>

# #         <p><strong>Customer Signature:</strong></p>
# #         <div style="margin-top:80px;">__________________________</div>
# #     </body>
# #     </html>
# #     """

# #     payload = {
# #         "emailSubject": f"Rental Return Charges - Order {order.order_id}",
# #         "documents": [{
# #             "documentBase64": base64.b64encode(html.encode()).decode(),
# #             "name": "Rental Return Charges",
# #             "fileExtension": "html",
# #             "documentId": "1",
# #         }],
# #         "recipients": {
# #             "signers": [{
# #                 "email": order.user.email,
# #                 "name": f"{order.user.firstName or ''} {order.user.lastName or ''}".strip() or order.user.email,
# #                 "recipientId": "1",
# #                 "routingOrder": "1",
# #                 "tabs": {
# #                     "signHereTabs": [{
# #                         "anchorString": "Customer Signature:",
# #                         "anchorUnits": "pixels",
# #                         "anchorYOffset": "10",
# #                         "anchorXOffset": "20",
# #                     }]
# #                 },
# #             }]
# #         },
# #         "status": "sent",  # send immediately
# #     }

# #     url = f"{base_url}/restapi/v2.1/accounts/{account_id}/envelopes"
# #     response = requests.post(url, headers=headers, json=payload)

# #     if response.status_code not in (200, 201):
# #         raise Exception(f"DocuSign Envelope Error: {response.text}")


# # rental/docusign.py  (ONLY UPDATED FUNCTION)
# def update_docusign_charges(order):
    # access_token = get_docusign_access_token()
    # account_id = os.getenv("DOCUSIGN_ACCOUNT_ID")
    # base_url = os.getenv("DOCUSIGN_BASE_URL")

    # headers = {
    #     "Authorization": f"Bearer {access_token}",
    #     "Content-Type": "application/json",
    # }

    # rows = ""
    # for item in order.items.all():
    #     rows += f"""
    #     <tr>
    #         <td>{item.product.productName}</td>
    #         <td>{item.quantity}</td>
    #         <td>{item.returned_quantity}</td>
    #         <td>{item.quantity - item.returned_quantity}</td>
    #         <td>{item.condition or 'N/A'}</td>
    #         <td>₹{float(item.lost_charge + item.damage_charge)}</td>
    #     </tr>
    #     """

    # html = f"""
    # <html>
    # <body>
    #     <h2>Rental Return Charges</h2>
    #     <table border="1">
    #         <tr>
    #             <th>Product</th><th>Qty</th><th>Returned</th>
    #             <th>Pending</th><th>Condition</th><th>Charges</th>
    #         </tr>
    #         {rows}
    #     </table>

    #     <br><br>
    #     <p><strong>Customer Signature:</strong></p>
    #     <div>______________________</div>
    # </body>
    # </html>
    # """

    # payload = {
    #     "emailSubject": f"Rental Return Update - Order {order.order_id}",
    #     "documents": [{
    #         "documentBase64": base64.b64encode(html.encode()).decode(),
    #         "name": "Return Charges",
    #         "fileExtension": "html",
    #         "documentId": "1",
    #     }],
    #     "recipients": {
    #         "signers": [{
    #             "email": order.user.email,
    #             "name": order.user.email,
    #             "recipientId": "1",
    #             "routingOrder": "1",
    #         }]
    #     },
    #     "status": "sent"
    # }

    # url = f"{base_url}/restapi/v2.1/accounts/{account_id}/envelopes"
    # response = requests.post(url, headers=headers, json=payload)

    # print("📨 DocuSign Status:", response.status_code)
    # print("📨 DocuSign Response:", response.text)

    # if response.status_code not in (200, 201):
    #     raise Exception("DocuSign sending failed")


# rental/docusign.py

#--------------------------------------------------------------

# rental/docusign.py
import base64
import os
import requests
from contracts.docusign_auth import get_docusign_access_token


# ---------------------------------------------------------
# Helper functions
# ---------------------------------------------------------

# def get_customer_name(order):
    # user = order.user
    # first = user.firstName or ""
    # last = user.lastName or ""
    # name = f"{first} {last}".strip()
    # return name if name else user.email


# def get_customer_email(order):
#     return order.user.email


# ---------------------------------------------------------
# 1️⃣ SEND RENTAL AGREEMENT (ORDER CREATION)
# ---------------------------------------------------------

# def send_rental_docusign_envelope(order):
#     access_token = get_docusign_access_token()

#     account_id = os.getenv("DOCUSIGN_ACCOUNT_ID")
#     base_url = os.getenv("DOCUSIGN_BASE_URL")

#     headers = {
#         "Authorization": f"Bearer {access_token}",
#         "Content-Type": "application/json"
#     }

#     customer_name = get_customer_name(order)
#     customer_email = get_customer_email(order)

#     items_text = ""
#     for item in order.items.all():
#         items_text += (
#             f"\nProduct: {item.product.productName}"
#             f"\nQuantity: {item.quantity}"
#             f"\nRental Price/Day: ₹{item.product.rental_price_per_day}\n"
#         )

#     document_text = f"""
# RENTAL AGREEMENT

# Order ID: {order.order_id}

# Customer Name: {customer_name}
# Email: {customer_email}

# Rental Start Date: {order.start_date}
# Rental End Date: {order.return_date}

# ITEMS:
# {items_text}

# TERMS:
# • Rental price is charged per item per day.
# • Grace period: 3 days after end date.
# • Late fee applies from 4th day.
# • Lost/Damaged items charged at lost price.
# • Items must be returned in original condition.

# Client Signature:
# **SIGN_HERE_CLIENT**




# Admin Approval:
# **SIGN_HERE_ADMIN**
# """

#     payload = {
#         "emailSubject": f"Rental Agreement - {order.order_id}",
#         "documents": [
#             {
#                 "documentBase64": base64.b64encode(
#                     document_text.encode("utf-8")
#                 ).decode("utf-8"),
#                 "name": "Rental Agreement",
#                 "fileExtension": "txt",
#                 "documentId": "1"
#             }
#         ],
#         "recipients": {
#             "signers": [
#                 {
#                     "email": customer_email,
#                     "name": customer_name,
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
#     response = requests.post(url, headers=headers, json=payload)

#     if response.status_code not in (200, 201):
#         raise Exception(response.text)

#     return response.json().get("envelopeId")


# ---------------------------------------------------------
# 2️⃣ SEND RETURN / LOST / DAMAGE DOCUSIGN (ALWAYS)
# ---------------------------------------------------------

# def update_docusign_charges(order):
#     """
#     This function is called on EVERY return action:
#     - Full return
#     - Partial return
#     - Lost item
#     - Damaged item
#     """

#     access_token = get_docusign_access_token()
#     account_id = os.getenv("DOCUSIGN_ACCOUNT_ID")
#     base_url = os.getenv("DOCUSIGN_BASE_URL")

#     headers = {
#         "Authorization": f"Bearer {access_token}",
#         "Content-Type": "application/json",
#     }

#     rows = ""
#     for item in order.items.all():
#         rows += f"""
#         <tr>
#             <td>{item.product.productName}</td>
#             <td>{item.quantity}</td>
#             <td>{item.returned_quantity}</td>
#             <td>{item.quantity - item.returned_quantity}</td>
#             <td>{item.condition or 'N/A'}</td>
#             <td>₹{float(item.lost_charge + item.damage_charge)}</td>
#         </tr>
#         """

#     html = f"""
# <html>
# <body>
#     <h2>Rental Return Summary</h2>

#     <table border="1" cellpadding="6" cellspacing="0">
#         <tr>
#             <th>Product</th>
#             <th>Total Qty</th>
#             <th>Returned</th>
#             <th>Pending</th>
#             <th>Condition</th>
#             <th>Charges</th>
#         </tr>
#         {rows}
#     </table>

#     <br>
#     <p><strong>Total Lost Charges:</strong> ₹{float(order.lost_charges)}</p>
#     <p><strong>Total Damage Charges:</strong> ₹{float(order.damage_charges)}</p>

#     <br><br>
#     <p><strong>Customer Signature:</strong></p>
#     <div>______________________</div>
# </body>
# </html>
# """

#     payload = {
#         "emailSubject": f"Rental Return Update - Order {order.order_id}",
#         "documents": [
#             {
#                 "documentBase64": base64.b64encode(html.encode()).decode(),
#                 "name": "Rental Return Charges",
#                 "fileExtension": "html",
#                 "documentId": "1",
#             }
#         ],
#         "recipients": {
#             "signers": [
#                 {
#                     "email": order.user.email,
#                     "name": get_customer_name(order),
#                     "recipientId": "1",
#                     "routingOrder": "1",
#                 }
#             ]
#         },
#         "status": "sent"
#     }

#     url = f"{base_url}/restapi/v2.1/accounts/{account_id}/envelopes"
#     response = requests.post(url, headers=headers, json=payload)

#     if response.status_code not in (200, 201):
#         raise Exception("DocuSign return envelope failed")

#     return response.json().get("envelopeId")


#-----------------------------------------------------
##Final Working File


# rental/docusign.py

# import base64
# import os
# import requests
# from contracts.docusign_auth import get_docusign_access_token


# def get_customer_name(order):
#     user = order.user
#     first = user.firstName or ""
#     last = user.lastName or ""
#     name = f"{first} {last}".strip()
#     return name if name else user.email


# def get_customer_email(order):
#     return order.user.email


# def send_rental_docusign_envelope(order):
#     access_token = get_docusign_access_token()

#     account_id = os.getenv("DOCUSIGN_ACCOUNT_ID")
#     base_url = os.getenv("DOCUSIGN_BASE_URL")

#     headers = {
#         "Authorization": f"Bearer {access_token}",
#         "Content-Type": "application/json"
#     }

#     customer_name = get_customer_name(order)
#     customer_email = get_customer_email(order)

#     items_text = ""
#     for item in order.items.all():
#         items_text += (
#             f"\nProduct: {item.product.productName}"
#             f"\nQuantity: {item.quantity}"
#             f"\nRental Price/Day: ₹{item.product.rental_price_per_day}\n"
#         )

#     document_text = f"""
# RENTAL AGREEMENT

# Order ID: {order.order_id}

# Customer Name: {customer_name}
# Email: {customer_email}

# Rental Start Date: {order.start_date}
# Rental End Date: {order.return_date}

# ITEMS:
# {items_text}

# TERMS:
# • Rental price is charged per item per day.
# • Grace period: 3 days after end date.
# • Late fee applies from 4th day.
# • Lost/Damaged items charged at original price.
# • Items must be returned in original condition.

# Client Signature:
# **SIGN_HERE_CLIENT**

# Admin Approval:
# **SIGN_HERE_ADMIN**
# """

#     payload = {
#         "emailSubject": f"Rental Agreement - {order.order_id}",
#         "documents": [
#             {
#                 "documentBase64": base64.b64encode(
#                     document_text.encode("utf-8")
#                 ).decode("utf-8"),
#                 "name": "Rental Agreement",
#                 "fileExtension": "txt",
#                 "documentId": "1"
#             }
#         ],
#         "recipients": {
#             "signers": [
#                 {
#                     "email": customer_email,
#                     "name": customer_name,
#                     "recipientId": "1",
#                     "routingOrder": "1",
#                 }
#             ]
#         },
#         "status": "sent"
#     }

#     url = f"{base_url}/restapi/v2.1/accounts/{account_id}/envelopes"
#     response = requests.post(url, headers=headers, json=payload)

#     if response.status_code not in (200, 201):
#         raise Exception(response.text)

#     return response.json().get("envelopeId")


# def update_docusign_charges(order):
#     access_token = get_docusign_access_token()
#     account_id = os.getenv("DOCUSIGN_ACCOUNT_ID")
#     base_url = os.getenv("DOCUSIGN_BASE_URL")

#     headers = {
#         "Authorization": f"Bearer {access_token}",
#         "Content-Type": "application/json",
#     }

#     rows = ""
#     for item in order.items.all():
#         rows += f"""
#         <tr>
#             <td>{item.product.productName}</td>
#             <td>{item.quantity}</td>
#             <td>{item.returned_quantity}</td>
#             <td>{item.quantity - item.returned_quantity}</td>
#             <td>{item.condition or 'N/A'}</td>
#             <td>₹{float(item.lost_charge + item.damage_charge)}</td>
#         </tr>
#         """

#     html = f"""
# <html>
# <body>
#     <h2>Rental Return Summary</h2>

#     <table border="1" cellpadding="6">
#         <tr>
#             <th>Product</th>
#             <th>Total Qty</th>
#             <th>Returned</th>
#             <th>Pending</th>
#             <th>Condition</th>
#             <th>Charges</th>
#         </tr>
#         {rows}
#     </table>

#     <p><strong>Total Lost Charges:</strong> ₹{float(order.lost_charge)}</p>
#     <p><strong>Total Damage Charges:</strong> ₹{float(order.damage_charge)}</p>

#     <br>
#     <p><strong>Customer Signature:</strong></p>
#     ______________________
# </body>
# </html>
# """

#     payload = {
#         "emailSubject": f"Rental Return Update - Order {order.order_id}",
#         "documents": [
#             {
#                 "documentBase64": base64.b64encode(html.encode()).decode(),
#                 "name": "Rental Return Charges",
#                 "fileExtension": "html",
#                 "documentId": "1",
#             }
#         ],
#         "recipients": {
#             "signers": [
#                 {
#                     "email": order.user.email,
#                     "name": get_customer_name(order),
#                     "recipientId": "1",
#                     "routingOrder": "1",
#                 }
#             ]
#         },
#         "status": "sent"
#     }

#     url = f"{base_url}/restapi/v2.1/accounts/{account_id}/envelopes"
#     response = requests.post(url, headers=headers, json=payload)

#     if response.status_code not in (200, 201):
#         raise Exception("DocuSign return envelope failed")

#     return response.json().get("envelopeId")

#--------------------------------------------------------------------------------------------------------

import os
import base64
import requests
from decimal import Decimal

#USE YOUR EXISTING WORKING AUTH
from contracts.docusign_auth import get_docusign_access_token


# -------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------

def get_customer_name(order):
    user = order.user
    first = getattr(user, "firstName", "") or ""
    last = getattr(user, "lastName", "") or ""
    name = f"{first} {last}".strip()
    return name if name else user.email


def get_customer_email(order):
    return order.user.email


# -------------------------------------------------------------------
# SEND RENTAL AGREEMENT (ORDER CREATION)
# -------------------------------------------------------------------

def send_rental_docusign_envelope(order):
    access_token = get_docusign_access_token()

    account_id = os.getenv("DOCUSIGN_ACCOUNT_ID")
    base_url = os.getenv("DOCUSIGN_BASE_URL")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    customer_name = get_customer_name(order)
    customer_email = get_customer_email(order)

    items_html = ""
    for item in order.items.all():
        items_html += f"""
        <li>
            {item.product.productName} |
            Qty: {item.quantity} |
            Rent/Day: ₹{item.product.rental_price_per_day}
        </li>
        """

    html_document = f"""
    <html>
    <body>
        <h2>Rental Agreement</h2>

        <p><strong>Order ID:</strong> {order.order_id}</p>
        <p><strong>Customer:</strong> {customer_name}</p>
        <p><strong>Email:</strong> {customer_email}</p>

        <p><strong>Rental Period:</strong>
        {order.start_date} → {order.return_date}</p>

        <h3>Items</h3>
        <ul>
            {items_html}
        </ul>

        <h3>Terms</h3>
        <ul>
            <li>Rental charged per day</li>
            <li>Grace period: 3 days</li>
            <li>Late fee applies after grace period</li>
            <li><strong>Lost / damaged items charged at original price</strong></li>
        </ul>

        <p><strong>Customer Signature:</strong></p>
        <p>/sign_here_client/</p>
    </body>
    </html>
    """

    payload = {
        "emailSubject": f"Rental Agreement - {order.order_id}",
        "documents": [
            {
                "documentBase64": base64.b64encode(
                    html_document.encode("utf-8")
                ).decode("utf-8"),
                "name": "Rental Agreement",
                "fileExtension": "html",
                "documentId": "1",
            }
        ],
        "recipients": {
            "signers": [
                {
                    "email": customer_email,
                    "name": customer_name,
                    "recipientId": "1",
                    "routingOrder": "1",
                    "tabs": {
                        "signHereTabs": [
                            {
                                "anchorString": "/sign_here_client/",
                                "anchorUnits": "pixels",
                                "anchorYOffset": "10",
                                "anchorXOffset": "20",
                            }
                        ]
                    },
                }
            ]
        },
        "status": "sent",
    }

    url = f"{base_url}/restapi/v2.1/accounts/{account_id}/envelopes"
    response = requests.post(url, headers=headers, json=payload)

    if response.status_code not in (200, 201):
        raise Exception(f"DocuSign send failed: {response.text}")

    return response.json().get("envelopeId")


# -------------------------------------------------------------------
# SEND RETURN / LOST / DAMAGE DOCUSIGN
# -------------------------------------------------------------------

def update_docusign_charges(order):
    access_token = get_docusign_access_token()

    account_id = os.getenv("DOCUSIGN_ACCOUNT_ID")
    base_url = os.getenv("DOCUSIGN_BASE_URL")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    total_lost_charge = Decimal("0.00")
    total_damage_charge = Decimal("0.00")

    rows = ""

    for item in order.items.all():
        lost_qty = max(item.quantity - item.returned_quantity, 0)
        lost_charge = Decimal(item.product.price) * lost_qty

        damage_charge = Decimal(getattr(item, "damage_charge", 0))

        total_lost_charge += lost_charge
        total_damage_charge += damage_charge

        rows += f"""
        <tr>
            <td>{item.product.productName}</td>
            <td>{item.quantity}</td>
            <td>{item.returned_quantity}</td>
            <td>{lost_qty}</td>
            <td>{item.condition or 'N/A'}</td>
            <td>₹{lost_charge + damage_charge}</td>
        </tr>
        """

    html = f"""
    <html>
    <body>
        <h2>Rental Return Summary</h2>

        <table border="1" cellpadding="6">
            <tr>
                <th>Product</th>
                <th>Total Qty</th>
                <th>Returned</th>
                <th>Lost</th>
                <th>Condition</th>
                <th>Charges</th>
            </tr>
            {rows}
        </table>

        <p><strong>Total Lost Charges:</strong> ₹{total_lost_charge}</p>
        <p><strong>Total Damage Charges:</strong> ₹{total_damage_charge}</p>

        <p><strong>Customer Signature:</strong></p>
        <p>/sign_here_client/</p>
    </body>
    </html>
    """

    payload = {
        "emailSubject": f"Rental Return Charges - {order.order_id}",
        "documents": [
            {
                "documentBase64": base64.b64encode(html.encode()).decode(),
                "name": "Rental Return Charges",
                "fileExtension": "html",
                "documentId": "1",
            }
        ],
        "recipients": {
            "signers": [
                {
                    "email": order.user.email,
                    "name": get_customer_name(order),
                    "recipientId": "1",
                    "routingOrder": "1",
                    "tabs": {
                        "signHereTabs": [
                            {
                                "anchorString": "/sign_here_client/",
                                "anchorUnits": "pixels",
                                "anchorYOffset": "10",
                                "anchorXOffset": "20",
                            }
                        ]
                    },
                }
            ]
        },
        "status": "sent",
    }

    url = f"{base_url}/restapi/v2.1/accounts/{account_id}/envelopes"
    response = requests.post(url, headers=headers, json=payload)

    if response.status_code not in (200, 201):
        raise Exception(f"DocuSign return envelope failed: {response.text}")

    return response.json().get("envelopeId")
