from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from django.db import IntegrityError
from .models import Users  # adjust import if needed
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password




# class UserSignupSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True, required=True, min_length=6)
#     email = serializers.EmailField(required=True)
#     userName = serializers.CharField(required=True, max_length=255)

#     class Meta:
#         model = Users
#         fields = [
#             "id",
#             "userName",
#             "email",
#             "userType",
#             "password",
#             "phone",
#             "firstName",
#             "lastName",
#             "language",
#             "gender",
#             "profileImage",
#             "stripeOrderCustomerId",
#             "loginType",
#         ]
#         read_only_fields = ["id"]

#     def validate_email(self, value):
#         if value and Users.objects.filter(email__iexact=value, isDeleted=False).exists():
#             raise serializers.ValidationError("A user with this email already exists.")
#         return value

#     def validate_userName(self, value):
#         if value and Users.objects.filter(userName__iexact=value, isDeleted=False).exists():
#             raise serializers.ValidationError("This username is already taken.")
#         return value
    
    
#     def validate_userType(self, value):
#         if value and Users.objects.filter(userType__iexact=value, isDeleted=False).exists():
#             raise serializers.ValidationError("User with This userType is already taken.")
#         return value


#     def create(self, validated_data):
#         raw_password = validated_data.pop("password")
#         validated_data["password"] = make_password(raw_password)
#         try:
#             user = Users.objects.create(**validated_data)
#         except IntegrityError:
#             raise serializers.ValidationError({"detail": "Database error when creating user."})
#         return user


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
            print("????/////////////")
            raise serializers.ValidationError("Invalid email or password.")

        if users.count() > 1:
            raise serializers.ValidationError("Duplicate users found for this email & userType. Please clean database.")

        user = users.first()

        # try:
        #     user = Users.objects.get(email=email,userType=userType, isDeleted=False)
        # except Users.DoesNotExist:
        #     raise serializers.ValidationError("Invalid email or password.")

        # Validate password manually because authenticate() won't work
        if not check_password(password, user.password):
            print("????/////////////>>>>>>>>>>>>>>>>>>>>>>")
            raise serializers.ValidationError("Invalid email or password.")

        # Optional: check if active
        if not user.isActive:
            raise serializers.ValidationError("User account is disabled.")

        data["user"] = user
        return data
