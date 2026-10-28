import os
from pathlib import Path
import base64
from docusign_esign import ApiClient, EnvelopesApi, EnvelopeDefinition, Document, Signer, SignHere, Recipients
from django.conf import settings


def _load_private_key():
    # 1. Environment variable DOCUSIGN_PRIVATE_KEY
    env_key = os.getenv("DOCUSIGN_PRIVATE_KEY")
    if env_key:
        if "-----BEGIN" not in env_key:
            try:
                return base64.b64decode(env_key)
            except Exception:
                pass
        return env_key.encode("utf-8")

    # 2. Configured file path
    configured_path = getattr(settings, "DOCUSIGN_PRIVATE_KEY_PATH", None)
    candidate_paths = []
    if configured_path:
        candidate_paths.append(Path(configured_path))
        if not Path(configured_path).is_absolute() and hasattr(settings, "BASE_DIR"):
            candidate_paths.append(settings.BASE_DIR / configured_path)

    if hasattr(settings, "BASE_DIR"):
        candidate_paths.extend([
            settings.BASE_DIR / "private.key",
            settings.BASE_DIR / "UniformWeb" / "docusign_private.key",
            settings.BASE_DIR / "docusign_private.key",
        ])

    for p in candidate_paths:
        if p and os.path.exists(p) and os.path.isfile(p):
            with open(p, "rb") as f:
                return f.read()

    raise FileNotFoundError(
        f"DocuSign private key not found at {configured_path or '/app/private.key'}. "
        f"Please provide DOCUSIGN_PRIVATE_KEY in .env or place the RSA private key file at {configured_path}."
    )


#<--------------TOKEN GENERATOR------------------->
def get_docusign_token():

    api_client = ApiClient()
    api_client.host = "https://demo.docusign.net/restapi"

    token_response = api_client.request_jwt_user_token(
        client_id=settings.DOCUSIGN_INTEGRATION_KEY,
        user_id=settings.DOCUSIGN_USER_ID,
        oauth_host_name="account-d.docusign.com",
        private_key_bytes=_load_private_key(),
        expires_in=3600,
        scopes=["signature", "impersonation"]
    )

    return token_response.access_token



#<------------------SEND ENVELOPE---------------------->
def send_contract(quotation, pdf_path):


    access_token = get_docusign_token()

    api_client = ApiClient()
    api_client.host = "https://demo.docusign.net/restapi"
    api_client.set_default_header("Authorization", f"Bearer {access_token}")

  
    with open(pdf_path, "rb") as f:
        encoded_file = base64.b64encode(f.read()).decode("utf-8")

    document = Document(
        document_base64=encoded_file,
        name="Quotation Contract",
        file_extension="pdf",
        document_id="1"
    )

    signer = Signer(
        email=quotation.email,
        name=quotation.contact_person or "Client",
        recipient_id="1",
        routing_order="1"
    )

    sign_here = SignHere(
        document_id="1",
        page_number="1",
        recipient_id="1",
        x_position="120",
        y_position="650"
    )

    signer.tabs = {"sign_here_tabs": [sign_here]}

    envelope = EnvelopeDefinition(
        email_subject=f"Please sign Quotation {quotation.quotation_id}",
        documents=[document],
        recipients=Recipients(signers=[signer]),
        status="sent"
    )

    envelopes_api = EnvelopesApi(api_client)
    result = envelopes_api.create_envelope(
        settings.DOCUSIGN_ACCOUNT_ID,
        envelope_definition=envelope
    )

    return result.envelope_id
