import os
import time
import jwt
import requests

# ====== DOCUSIGN CONFIG ======

DOCUSIGN_INTEGRATION_KEY = "84075333-5a47-41d1-aa4c-ed81fa4f1d89"
DOCUSIGN_USER_ID = "014d6609-430a-4333-adce-b119673b7219"
DOCUSIGN_AUTH_SERVER = "account-d.docusign.com"

# Django project root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Path to your RSA private key file
PRIVATE_KEY_FILE = os.path.join(BASE_DIR, "docusign_private.key")

# Load private key
with open(PRIVATE_KEY_FILE, "r") as f:
    PRIVATE_KEY = f.read()


def get_docusign_access_token():
    now = int(time.time())

    payload = {
        "iss": DOCUSIGN_INTEGRATION_KEY,
        "sub": DOCUSIGN_USER_ID,
        "aud": "account-d.docusign.com",
        "iat": now,
        "exp": now + 3600,
        "scope": "signature impersonation"
    }

    jwt_token = jwt.encode(payload, PRIVATE_KEY, algorithm="RS256")

    response = requests.post(
        "https://account-d.docusign.com/oauth/token",
        data={
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": jwt_token
        }
    )

    response.raise_for_status()
    return response.json()["access_token"]
