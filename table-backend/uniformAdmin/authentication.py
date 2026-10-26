"""
Staff (admin-panel) authentication and permissions.

Kept in its own module with minimal imports so any view module can use it without
circular imports (auth.py pulls in serializers, utils, fabric, ...).

Why this exists:
- DEFAULT_PERMISSION_CLASSES is AllowAny, and the old IsAdminUserJWT / SimpleJWT
  authenticators returned None when no Authorization header was sent, so every
  "admin" endpoint ran as AnonymousUser for a request with no token at all.
- Customer tokens (userhub.utils.generate_custom_tokens) are signed with the same
  SECRET_KEY and carry the same `user_id` claim, so a customer with id N was
  accepted as AdminUser N.
- B2B / B2C customers are AdminUser rows too (told apart only by role), so any
  check that only asked "is this an active AdminUser?" let customers into admin APIs.
"""
import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated
from rest_framework.permissions import SAFE_METHODS, BasePermission
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import AdminUser

# Roles stored on AdminUser that belong to customers, not staff. Tokens for these
# roles must never reach admin-panel endpoints.
CUSTOMER_ROLE_NAMES = {"b2b", "b2b_user", "b2c", "customer", "corporate"}


def role_name_of(user):
    role = getattr(user, "role", None)
    return (getattr(role, "role_name", "") or "").lower() if role else ""


def is_staff_user(user):
    """True for an active AdminUser whose role is a staff role (admin, sales, manager, ...)."""
    return (
        isinstance(user, AdminUser)
        and user.is_active
        and role_name_of(user) not in CUSTOMER_ROLE_NAMES
    )


def _raw_token(request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise NotAuthenticated("Authentication credentials were not provided.")
    # Accept the token with or without the "Bearer " prefix, as before.
    if " " in auth_header:
        prefix, token = auth_header.split(" ", 1)
        if prefix.lower() != "bearer":
            raise AuthenticationFailed("Invalid token prefix")
        return token
    return auth_header


def _decode_staff_token(token):
    try:
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed("Token has expired")
    except jwt.InvalidTokenError:
        raise AuthenticationFailed("Invalid token")

    # Only SimpleJWT access tokens (admin / B2B login) carry token_type. This rejects
    # customer tokens and refresh tokens used as access tokens.
    if decoded.get("token_type") != "access":
        raise AuthenticationFailed("Invalid token")
    if not decoded.get("user_id"):
        raise AuthenticationFailed("Token missing user ID")
    return decoded


def _staff_user(user_id):
    user = AdminUser.objects.select_related("role").filter(id=user_id, is_active=True).first()
    if not user:
        raise AuthenticationFailed("User not found or inactive")
    if not is_staff_user(user):
        raise AuthenticationFailed("This account cannot access the admin panel")
    return user


class IsAdminUserJWT(BaseAuthentication):
    """
    JWT authentication for admin-panel staff (Admin, Sales Rep, Staff, ...).
    A token is required; customer tokens and customer roles are rejected.
    """

    def authenticate(self, request):
        token = _raw_token(request)
        decoded = _decode_staff_token(token)
        user = _staff_user(decoded["user_id"])
        user.role_name = user.role.role_name if user.role else "user"
        return (user, token)

    def authenticate_header(self, request):
        return "Bearer"


class MultiRoleJWTAuth(BaseAuthentication):
    """
    Like IsAdminUserJWT, but the token's `role` claim must also match the user's
    current role (so a token issued before a role change stops working).
    """

    def authenticate(self, request):
        token = _raw_token(request)
        decoded = _decode_staff_token(token)
        role_claim = decoded.get("role")
        if not role_claim:
            raise AuthenticationFailed("Invalid token")

        user = _staff_user(decoded["user_id"])
        user.role_instance = user.role
        user.role_name = user.role.role_name if user.role else None
        if (user.role_name or "").lower() != role_claim.lower():
            raise AuthenticationFailed("Role mismatch")
        return (user, token)

    def authenticate_header(self, request):
        return "Bearer"


class StaffJWTAuthentication(JWTAuthentication):
    """
    SimpleJWT authentication for admin-panel endpoints: a token is required and the
    account must be staff. Plain JWTAuthentication returns None without a header and
    accepts B2B customers' tokens.
    """

    def authenticate(self, request):
        result = super().authenticate(request)
        if result is None:
            raise NotAuthenticated("Authentication credentials were not provided.")
        user, validated_token = result
        if not is_staff_user(user):
            raise AuthenticationFailed("This account cannot access the admin panel")
        return user, validated_token


class IsStaffUser(BasePermission):
    """Request must come from an authenticated admin-panel staff account."""

    def has_permission(self, request, view):
        return is_staff_user(request.user)


class StaffWriteOrReadOnly(BasePermission):
    """Anyone may read (GET/HEAD/OPTIONS); only staff may write."""

    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or is_staff_user(request.user)
