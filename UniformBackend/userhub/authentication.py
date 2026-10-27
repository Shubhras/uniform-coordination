import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from userhub.models import Users
from uniformAdmin.models import AdminUser


class CustomUserJWTAuthentication(BaseAuthentication):
    """
    Default authenticator. Resolves a token to exactly one kind of account:

    - SimpleJWT access tokens (admin / B2B login, carry `token_type`) -> AdminUser
    - Custom customer access tokens (userhub.utils.generate_custom_tokens, carry `type`) -> Users

    Both kinds are signed with SECRET_KEY and use the same `user_id` claim, and the two
    tables have independent ids. Looking an id up in the "other" table would sign the
    caller in as a different person (e.g. customer 5 as AdminUser 5), so a token is
    never resolved against the table it was not issued for.
    """

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return None  # no token → DRF will mark user as Anonymous

        try:
            prefix, token = auth_header.split(" ")
            if prefix.lower() != "bearer":
                raise AuthenticationFailed("Invalid token header")

            decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])

            user_id = decoded.get("user_id")
            if not user_id:
                raise AuthenticationFailed("Invalid token: user_id missing")

            if "token_type" in decoded:
                if decoded["token_type"] != "access":
                    raise AuthenticationFailed("Invalid token type")
                admin_user = AdminUser.objects.filter(id=user_id, is_active=True).first()
                if admin_user:
                    return (admin_user, None)
            elif decoded.get("type") == "access":
                user = Users.objects.filter(id=user_id, isDeleted=False).first()
                if user:
                    return (user, None)
            else:
                raise AuthenticationFailed("Invalid token type")

            raise AuthenticationFailed("User not found")

        except AuthenticationFailed:
            raise
        except Exception as e:
            raise AuthenticationFailed(str(e))
