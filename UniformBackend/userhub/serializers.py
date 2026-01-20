from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from django.db import IntegrityError
from .models import *  # adjust import if needed
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
from datetime import date
# from userhub.models import Notifications
from uniformAdmin.serializers import *

class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    email = serializers.EmailField(required=True)
    userName = serializers.CharField(required=False, max_length=255)
    userType = serializers.CharField(required=True)

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


class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    cartitem =CartItemSerializer(read_only=True)
    order = OrderSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'



class FavouriteSerializer(serializers.ModelSerializer):
    product_type = serializers.CharField(
        source="product.productType",
        read_only=True
    )

    class Meta:
        model = Favourite
        fields = ["id", "product", "product_type", "is_like"]


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

class ModelInfoSerializer(serializers.ModelSerializer):
    isActive = serializers.BooleanField(default=True)
    isDeleted = serializers.BooleanField(default=False)
    class Meta:
        model = ModelInfo
        fields = [
            'id',
            'product',
            'model_file',
            'description',
            'isActive',
            'isDeleted',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_model_file(self, obj):
        request = self.context.get('request')
        if obj.model_file and request:
            return request.build_absolute_uri(obj.model_file.url)
        return None
 

# class CustomUpdateModelQuotationSerializer(serializers.ModelSerializer):
#     model_info = ModelInfoSerializer(read_only=True)

#     class Meta:
#         model = CustomUpdateModels
#         fields = [
#             'id',
#             'model_info',
#             'design_specifications',  
#             'isActive',
#             'created_at',
#         ]
class CustomUpdateModelQuotationSerializer(serializers.ModelSerializer):
    model_info = ModelInfoSerializer(read_only=True)

    class Meta:
        model = CustomUpdateModels
        fields = [
            'id',
            'model_info',
            'design_specifications',  
            'isActive',
            'created_at',
        ]

# class QuotationRequestSerializer(serializers.ModelSerializer):
#     customupdatemodel = CustomUpdateModelQuotationSerializer(read_only=True) 
#     class Meta:
#         model = QuotationRequest
#         fields = [
#             "uuids",
#             "quotation_id",
#             "company_name",
#             "contact_person",
#             "email",
#             "phone_number",
#             "customupdatemodel",
#             "item_type",
#             "material",
#             "size_quantity",
#             "delivery_date",
#             "additional_note",
#             "agreed_to_terms",
#             "isActive",
#             "isDeleted",
#             "created_at",
#             "updated_at",
#         ]
#         read_only_fields = ("uuids", "created_at", "updated_at")

#     def validate_agreed_to_terms(self, value):
#         if value is not True:
#             raise serializers.ValidationError(
#                 "You must agree to privacy policy & terms."
#             )
#         return value
#     def create(self, validated_data):
#         if not validated_data.get("quotation_id"):
#             validated_data["quotation_id"] = f"QUOT-{uuid.uuid4().hex[:6].upper()}"
#         return super().create(validated_data)

class QuotationRequestSerializer(serializers.ModelSerializer):
    customsave = serializers.PrimaryKeyRelatedField(source="customupdatemodel",queryset=CustomUpdateModels.objects.filter(isActive=True, isDeleted=False),required=True)


    class Meta:
        model = QuotationRequest
        fields = [
            "uuids",
            "quotation_id",
            "company_name",
            "contact_person",
            "email",
            "phone_number",
            "customsave",   
            "item_type",
            "material",
            "size_quantity",
            "delivery_date",
            "additional_note",
            "agreed_to_terms",
            "isActive",
            "isDeleted",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("uuids", "created_at", "updated_at")

    def validate_agreed_to_terms(self, value):
        if value is not True:
            raise serializers.ValidationError(
                "You must agree to privacy policy & terms."
            )
        return value
    
    def validate_customsave(self, value):
        request = self.context.get("request")
        if value.user != request.user:
            raise serializers.ValidationError(
                "You can only use your own Custom Save model."
            )
        return value

    def create(self, validated_data):
        # Auto generate quotation_id
        if not validated_data.get("quotation_id"):
            validated_data["quotation_id"] = f"QUOT-{uuid.uuid4().hex[:6].upper()}"

        # Auto assign latest CustomUpdateModels if FK not provided
        if "customupdatemodel" not in validated_data or validated_data["customupdatemodel"] is None:
            latest_model = CustomUpdateModels.objects.filter(
                isActive=True, isDeleted=False
            ).order_by("-created_at").first()
            if latest_model:
                validated_data["customupdatemodel"] = latest_model

        return super().create(validated_data)

class CustomUpdateModelsSerializer(serializers.ModelSerializer):
    product_details = serializers.SerializerMethodField()
    category_details = serializers.SerializerMethodField()
    subcategory_details = serializers.SerializerMethodField()

    class Meta:
        model = CustomUpdateModels
        fields = "__all__"
    def get_category_details(self, obj):
        request = self.context.get("request")
        # fetch first product related to this model_info
        product = Product.objects.filter(model_info=obj.model_info).first()
        if not product or not getattr(product, "category", None):
            return None

        category = product.category
        return {
            "id": category.id,
            "name": getattr(category, "categoryName", ""),
            "slug": getattr(category, "slug", "")
        }
    def get_subcategory_details(self, obj):
        request = self.context.get("request")
        product = Product.objects.filter(model_info=obj.model_info).first()
        if not product or not getattr(product, "subcategory", None):
            return None

        subcategory = product.subcategory
        return {
            "id": subcategory.id,
            "name": getattr(subcategory, "name", ""),
            "slug": getattr(subcategory, "slug", "")
        }
   
    def get_product_details(self, obj):
        request = self.context.get("request")
        category_slug = request.GET.get("category")

        qs = Product.objects.filter(model_info=obj.model_info)
        if category_slug:
            qs = qs.filter(category__slug__iexact=category_slug)

        # pass request in context to serializer
        serializer = ProductSerializer(qs, many=True, context={"request": request})
        return serializer.data


   