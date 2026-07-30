import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from userhub.models import Users

class UserJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return None

        if not auth_header.startswith("Bearer "):
            raise exceptions.AuthenticationFailed("Invalid token header")

        token = auth_header.split(" ")[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token expired")
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed("Invalid token")

        try:
            user = Users.objects.get(id=payload["user_id"])
        except Users.DoesNotExist:
            raise exceptions.AuthenticationFailed("User not found")

        return (user, None)
