from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from django.db import IntegrityError
from .models import *  # adjust import if needed
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
# from userhub.models import Notifications





class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    email = serializers.EmailField(required=True)
    userName = serializers.CharField(required=True, max_length=255)

    class Meta:
        model = Users
        fields = [
            "id",
            "userName",
            "email",
            "userType",
            "password",
            "phone",
            "firstName",
            "lastName",
            "language",
            "gender",
            "profileImage",
            "stripeOrderCustomerId",
            "loginType",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        email = attrs.get("email")
        userType = attrs.get("userType")

        if email and userType:
            if Users.objects.filter(
                email__iexact=email,
                userType__iexact=userType,
                isDeleted=False
            ).exists():
                raise serializers.ValidationError(
                    "User with this email and userType already exists."
                )

        return attrs

    # -----------------------------
    #  FIX: Hash password on create
    # -----------------------------
    def create(self, validated_data):
        password = validated_data.pop("password")  # remove raw password
        user = Users(**validated_data)
        user.set_password(password)  # hash password here
        user.save()
        return user


class UserResponseSerializer(serializers.ModelSerializer):
    roleName = serializers.CharField(source='role.role_name', read_only=True)

    class Meta:
        model = Users
        fields = [
            "id",
            "role",          # appears right after ID
            "roleName",      # also right after role
            "email",
            "phone",
            "userType",
            "userName",
            "firstName",
            "lastName",
            "language",
            "gender",
            "profileImage",
            "lastLogin",
            "isActive",
            "appleID",
            "stripeOrderCustomerId",
            "loginType",
            "createdAt",
            "updatedAt",
        ]
        read_only_fields = fields


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    userType = serializers.CharField(required=True)


    def validate(self, data):
        email = data.get("email")
        password = data.get("password")
        userType = data.get("userType")

        # Check user by email
        # Find all matching users
        users = Users.objects.filter(email=email, userType=userType, isDeleted=False)

        if not users.exists():
            raise serializers.ValidationError("Invalid email or password.")

        if users.count() > 1:
            raise serializers.ValidationError("Duplicate users found for this email & userType. Please clean database.")

        user = users.first()

     
        # Validate password manually because authenticate() won't work
        if not check_password(password, user.password):
            raise serializers.ValidationError("Invalid email or password.")

        # Optional: check if active
        if not user.isActive:
            raise serializers.ValidationError("User account is disabled.")

        data["user"] = user
        return data


class VerifyUserSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(required=True)
    is_verify = serializers.BooleanField(required=True)

    def validate(self, attrs):
        if attrs["is_verify"] is not True:
            raise serializers.ValidationError("is_verify must be true.")
        return attrs
    

# ___________________CART_____________________________

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.productName",
        read_only=True
    )

    class Meta:
        model = CartItem
        fields = "__all__"
        


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    cart_total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = "__all__"

    def get_cart_total(self, obj):
        return sum(item.total_price for item in obj.items.all())



class CustomerDetailSerializer(serializers.ModelSerializer):
    class Meta:
        models = CustomerDetails
        fields ="__all__"
























# from rest_framework import serializers


# class NotificationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Notifications
#         fields = [
#             "id",
#             "type",
#             "is_enabled",
#             "isActive",
#             "isDeleted",
#             "created_at",
#             "updated_at",
#         ]
#         read_only_fields = ["id", "created_at", "updated_at"]

#     def validate(self, attrs):
#         if "type" in attrs and not attrs["type"]:
#             raise serializers.ValidationError("Notification type is required.")
#         return attrs
