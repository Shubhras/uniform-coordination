#contracts/docusign_client.py

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

# ------------
# ENV
# --------------
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

