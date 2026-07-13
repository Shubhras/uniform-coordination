from docusign_esign import ApiClient

api_client = ApiClient()
api_client.host = "https://demo.docusign.net/restapi"

ACCESS_TOKEN = api_client.request_jwt_user_token(
    client_id="2abc67a8-b4d2-439d-8742-e26437450cc1",
    user_id="02601a1d-eb9b-41de-a590-ea0c4e99d6ea",
    oauth_host_name="account-d.docusign.com",
    private_key_bytes=open("private.key", "rb").read(),
    expires_in=3600,
    scopes=["signature", "impersonation"]
)

print("TOKEN:", ACCESS_TOKEN.access_token)
