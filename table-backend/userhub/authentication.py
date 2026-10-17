import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from userhub.models import Users
from uniformAdmin.models import AdminUser


class CustomUserJWTAuthentication(BaseAuthentication):

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return None  # no token → DRF will mark user as Anonymous

        try:
            prefix, token = auth_header.split(" ")
            if prefix.lower() != "bearer":
                raise AuthenticationFailed("Invalid token header")

            # decode your custom token
            decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])

            user_id = decoded.get("user_id")
            if not user_id:
                raise AuthenticationFailed("Invalid token: user_id missing")

            # 1. If admin token or role is present, check AdminUser
            role = decoded.get("role")
            if role:
                admin_user = AdminUser.objects.filter(id=user_id, is_active=True).first()
                if admin_user:
                    return (admin_user, None)

            # 2. Check customer / end-user
            user = Users.objects.filter(id=user_id, isDeleted=False).first()
            if user:
                return (user, None)

            # 3. Fallback check for AdminUser
            admin_user = AdminUser.objects.filter(id=user_id, is_active=True).first()
            if admin_user:
                return (admin_user, None)

            raise AuthenticationFailed("User not found")

        except Exception as e:
            raise AuthenticationFailed(str(e))

