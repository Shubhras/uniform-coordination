from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
import re
from .models import *
# User = get_user_model()
import json

class AdminLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    remember_me = serializers.BooleanField(default=False)
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            raise serializers.ValidationError("Email and password are required")

        try:
            user = AdminUser.objects.get(email=email)
        except AdminUser.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials or not an admin")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials or not an admin")

        if not user.is_staff:
            raise serializers.ValidationError("User is not an admin")

        data['user'] = user
        return data


class AdminChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_new_password = serializers.CharField(write_only=True)


    def validate_new_password(self, value):
        """
        Validate strong password rules:
        - Minimum 6 characters
        - At least one letter
        - At least one number
        - At least one special character (@,#,$, etc.)
        """
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long.")
        if not re.search(r"[A-Za-z]", value):
            raise serializers.ValidationError("Password must contain at least one letter.")
        if not re.search(r"[0-9]", value):
            raise serializers.ValidationError("Password must contain at least one number.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise serializers.ValidationError("Password must contain at least one special character like @,#,$.")
        return value
    

    def validate(self, data):
        user = self.context['request'].user

        # Check current password
        if not user.check_password(data.get('current_password')):
            raise serializers.ValidationError({"current_password": "Current password is incorrect"})

        # Check new password match
        if data.get('new_password') != data.get('confirm_new_password'):
            raise serializers.ValidationError({"confirm_new_password": "New passwords do not match"})

        return data

class AdminUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminUser
        fields = ['name',"email", 'mobile', 'language','email']


class AdminDetailSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)

    class Meta:
        model = AdminUser
        exclude = ['password']
        read_only_fields = ['id',"email","name","mobile","language",'is_staff', 'is_superuser', 'last_login', 'date_joined']


class FabricSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fabric
        fields = '__all__'


class PartsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parts
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "usageTemmpCount"]


class FabricMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fabric
        fields = ["id", "fabricName"]


class ColorsSerializer(serializers.ModelSerializer):
    compatibleFabric = FabricMiniSerializer(many=True, read_only=True)
    compatibleFabric_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Colors
        fields = [
            "id",
            "colorName",
            "colorCode",
            "compatibleFabric",
            "compatibleFabric_ids",
            "isActive",
            "isDeleted",
            "created_at",
            "updated_at"
        ]

    def create(self, validated_data):
        fabric_ids = validated_data.pop("compatibleFabric_ids", [])
        color = Colors.objects.create(**validated_data)
        if fabric_ids:
            color.compatibleFabric.set(fabric_ids)
        return color

    def update(self, instance, validated_data):
        fabric_ids = validated_data.pop("compatibleFabric_ids", None)

        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        if fabric_ids is not None:
            instance.compatibleFabric.set(fabric_ids)

        return instance



class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = "__all__"




class BlogSerializer(serializers.ModelSerializer):
    categoryName = serializers.CharField(
        source="category.categoryName",
        read_only=True
    )

    # 🔹 WRITE image to DB
    image = serializers.ImageField(required=False, allow_null=True)

    slug = serializers.SerializerMethodField()
    isActive = serializers.BooleanField(default=True)

    class Meta:
        model = Blog
        fields = [
            "id",
            "title",
            "slug",
            "category",
            "categoryName",
            "image",        # ✅ ONLY ONE image field
            "description",
            "isActive",
            "created_at",
            "updated_at",
        ]

    # -----------------------------
    # Replace dash (-) with underscore (_)
    # -----------------------------
    def get_slug(self, obj):
        if obj.slug:
            return obj.slug.replace("-", "_")
        return None

    # -----------------------------
    # Return ABSOLUTE image URL using SAME field
    # -----------------------------
    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")

        if instance.image and request:
            data["image"] = request.build_absolute_uri(instance.image.url)
        else:
            data["image"] = None

        return data

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title is required.")
        return value



class FAQDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQDescription
        fields = ["id", "description"]



class FAQSerializer(serializers.ModelSerializer):
    descriptions = FAQDescriptionSerializer(many=True)

    class Meta:
        model = FAQ
        fields = ["id", "title", "descriptions", "isActive", "created_at", "updated_at"]

    # Make title unique
    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Title is required.")
        if FAQ.objects.filter(title=value.strip(), isDeleted=False).exists():
            raise serializers.ValidationError("FAQ with this title already exists.")
        return value

    # Handle nested descriptions on create
    def create(self, validated_data):
        descriptions_data = validated_data.pop("descriptions", [])
        faq = FAQ.objects.create(**validated_data)
        for desc in descriptions_data:
            FAQDescription.objects.create(faq=faq, **desc)
        return faq

    # Handle nested descriptions on update
    def update(self, instance, validated_data):
        descriptions_data = validated_data.pop("descriptions", None)
        instance.title = validated_data.get("title", instance.title)
        instance.isActive = validated_data.get("isActive", instance.isActive)
        instance.save()

        if descriptions_data is not None:
            # Remove old descriptions
            instance.descriptions.all().delete()
            # Create new ones
            for desc in descriptions_data:
                FAQDescription.objects.create(faq=instance, **desc)

        return instance



class CategorySerializer(serializers.ModelSerializer):
    slug = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id",
            "categoryName",
            "slug",
            "isActive",
            "order",
            "created_at",
            "updated_at",
        ]

    def get_slug(self, obj):
        return obj.slug.replace("-", "_") if obj.slug else None

    def validate_categoryName(self, value):
        qs = Category.objects.filter(
            categoryName__iexact=value,
            isDeleted=False
        )

        # Exclude current instance during update
        if self.instance:
            qs = qs.exclude(id=self.instance.id)

        if qs.exists():
            raise serializers.ValidationError(
                "Category with this categoryName already exists."
            )

        return value.strip()



class CatalogImageSerializer(serializers.ModelSerializer):

    name = serializers.CharField(
        required=True,
        error_messages={
            "required": "Catelog Image Name is required.",
            "blank": "Catelog Image Name is required.",
        }
    )

    category = serializers.PrimaryKeyRelatedField(
        queryset=CatalogImage._meta.get_field("category").remote_field.model.objects.all(),
        required=True,
        error_messages={
            "required": "category is required.",
            "null": "category is required.",
        }
    )

    image = serializers.ImageField(
        required=True,
        error_messages={
            "required": "Catelog Image is required.",
            "invalid": "Catelog Image is required.",
        }
    )

    description = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = CatalogImage
        fields = [
            "id",
            "name",
            "image",
            "slug",
            "category",
            "description",
            "isActive",
            "isDeleted",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("slug",)

    def validate_name(self, value):
        qs = CatalogImage.objects.filter(name__iexact=value, isDeleted=False)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)

        if qs.exists():
            raise serializers.ValidationError(
                "Catalog Image with this Name already exists."
            )
        return value



class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = [            
            "id",
            "name",
            "category",           
            "subcategoryImage",
            "slug",
            "description",
            "isActive",
            "isDeleted",
            "created_at",
            "updated_at"
        ]
        read_only_fields = ("id", "created_at", "updated_at")

    def validate(self, attrs):
        name = attrs.get("name")
        category = attrs.get("category")

        if name and category:
            exists = SubCategory.objects.filter(
                name__iexact=name,
                category=category,
                isDeleted=False
            ).exists()

            if exists:
                raise serializers.ValidationError({
                    "name": "Validation Failed;subcategory with this name already exists in this category."
                })

        return attrs


class ProductSerializer(serializers.ModelSerializer):
    parts = serializers.PrimaryKeyRelatedField(
        queryset=Parts.objects.filter(isActive=True, isDeleted=False),
        many=True,
        required=False
    )

    class Meta:
        model = Product
        fields = [
            "id", "productName", "slug", "description", "productType",
            "category", "subcategory", "parts", "price", "discount",
            "total_quantity", "available_quantity",
            "ProductImage", "isActive", "created_at"
        ]
        read_only_fields = ["slug", "created_at"]

    # ✅ IMPORTANT: handle parts = "[1,2,3]" from form-data
    def to_internal_value(self, data):
        data = data.copy()

        parts = data.get("parts")
        if parts and isinstance(parts, str):
            try:
                data.setlist("parts", json.loads(parts))
            except (json.JSONDecodeError, TypeError):
                raise serializers.ValidationError({
                    "parts": "Invalid format. Use [1,2,3]."
                })

        return super().to_internal_value(data)

    #  Category → Subcategory + quantity validation
    def validate(self, data):
        category = data.get("category")
        subcategory = data.get("subcategory")

        if subcategory and subcategory.category != category:
            raise serializers.ValidationError({
                "subcategory": "Selected subcategory does not belong to selected category"
            })

        total_qty = data.get("total_quantity", 0)
        avail_qty = data.get("available_quantity", 0)

        if avail_qty > total_qty:
            raise serializers.ValidationError({
                "available_quantity": "Available quantity cannot exceed total quantity"
            })

        return data
