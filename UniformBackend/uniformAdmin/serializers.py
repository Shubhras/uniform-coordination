from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
import re
from django.utils import timezone
from .models import *
from datetime import timedelta
from .utils import get_default_b2b_role
from userhub.models import *
# User = get_user_model()
import json

# class AdminLoginSerializer(serializers.Serializer):
#     email = serializers.EmailField()
#     password = serializers.CharField(write_only=True)
#     remember_me = serializers.BooleanField(default=False)
    
#     def validate(self, data):
#         email = data.get('email')
#         password = data.get('password')

#         if not email or not password:
#             raise serializers.ValidationError("Email and password are required")

#         try:
#             user = AdminUser.objects.get(email=email)
#         except AdminUser.DoesNotExist:
#             raise serializers.ValidationError("Invalid credentials or not an admin")

#         if not user.check_password(password):
#             raise serializers.ValidationError("Invalid credentials or not an admin")

#         if not user.is_staff:
#             raise serializers.ValidationError("User is not an admin")

#         data['user'] = user
#         return data

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
            raise serializers.ValidationError("Invalid credentials Not match User Name")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials Not match Password")

        # Remove the strict is_staff check
        # if not user.is_staff:
        #     raise serializers.ValidationError("User is not an admin")

        data['user'] = user
        return data


# class AdminChangePasswordSerializer(serializers.Serializer):
#     current_password = serializers.CharField(write_only=True)
#     new_password = serializers.CharField(write_only=True)
#     confirm_new_password = serializers.CharField(write_only=True)


#     def validate_new_password(self, value):
#         """
#         Validate strong password rules:
#         - Minimum 6 characters
#         - At least one letter
#         - At least one number
#         - At least one special character (@,#,$, etc.)
#         """
#         if len(value) < 6:
#             raise serializers.ValidationError("Password must be at least 6 characters long.")
#         if not re.search(r"[A-Za-z]", value):
#             raise serializers.ValidationError("Password must contain at least one letter.")
#         if not re.search(r"[0-9]", value):
#             raise serializers.ValidationError("Password must contain at least one number.")
#         if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
#             raise serializers.ValidationError("Password must contain at least one special character like @,#,$.")
#         return value
    

#     def validate(self, data):
#         user = self.context['request'].user

#         # Check current password
#         if not user.check_password(data.get('current_password')):
#             raise serializers.ValidationError({"current_password": "Current password is incorrect"})

#         # Check new password match
#         if data.get('new_password') != data.get('confirm_new_password'):
#             raise serializers.ValidationError({"confirm_new_password": "New passwords do not match"})

#         return data

class AdminChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
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

        if not user.check_password(data.get('current_password')):
            raise serializers.ValidationError({"current_password": "Current password is incorrect"})

        if data.get('new_password') != data.get('confirm_new_password'):
            raise serializers.ValidationError({"confirm_new_password": "New passwords do not match"})

        return data


class AdminUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminUser
        fields = ['name',"email", 'mobile', 'language','email']


class AdminDetailSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.role_name', read_only=True)


    class Meta:
        model = AdminUser
        exclude = ['password']
        read_only_fields = ['id',"email","name","mobile","language",'is_staff', 'is_superuser', 'last_login', 'date_joined']





class FabricSerializer(serializers.ModelSerializer):
    theme = serializers.PrimaryKeyRelatedField(
        queryset=TableTheme.objects.filter(is_active=True, isDeleted=False),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Fabric
        fields = '__all__'

    def validate(self, data):
        fabric_type = data.get("fabricType")
        theme = data.get("theme")

        # Table → theme REQUIRED
        if fabric_type == "table" and not theme:
            raise serializers.ValidationError({
                "theme": "Theme is required when fabric type is table."
            })

        # Uniform → theme NOT allowed
        if fabric_type == "uniform" and theme:
            raise serializers.ValidationError({
                "theme": "Theme is not allowed in uniform."
            })

        return data





class PartsSerializer(serializers.ModelSerializer):
    theme = serializers.PrimaryKeyRelatedField(
        queryset=TableTheme.objects.filter(is_active=True, isDeleted=False),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Parts
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "usageTemmpCount"]

    def validate(self, data):
        part_type = data.get("partType")
        theme = data.get("theme")

        # TABLE → theme required
        if part_type == "table" and not theme:
            raise serializers.ValidationError({
                "theme": "Please Select themes for Table."
            })

        # UNIFORM → theme NOT allowed
        if part_type == "uniform" and theme:
            raise serializers.ValidationError({
                "theme": "Theme is not allowed for uniform."
            })

        return data



class FabricMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fabric
        fields = ["id", "fabricName"]


# class ColorsSerializer(serializers.ModelSerializer):
#     # compatibleFabric_ids = serializers.ListField(
#     #     child=serializers.IntegerField(),
#     #     write_only=True,
#     #     required=False
#     # )

#     compatibleFabric = serializers.ListField(
#         compatibleFabric=serializers.ChoiceField(compatibleFabric=Colors.MATERIAL_CHOICES),  
#         required=True,
#     )
#     class Meta:
#         model = Colors
#         fields = [
#             "id",
#             "colorName",
#             "colorCode",
#             "compatibleFabric",
#             "isActive",
#             "isDeleted",
#             "created_at",
#             "updated_at"
#         ]

#     def validate_compatibleFabric(self, value):
#         if len(value) == 0:
#             raise serializers.ValidationError("Please select at least one fabric.")
#         return value
    
#     def validate_colorName(self, value):
#         if Colors.objects.filter(colorName__iexact=value, isDeleted=False).exists():
#             raise serializers.ValidationError("This color name already exists.")
#         return value  
   
  

#     # def create(self, validated_data):
#     #     fabric_ids = validated_data.pop("compatibleFabric_ids", [])
#     #     color = Colors.objects.create(**validated_data)
#     #     if fabric_ids:
#     #         color.compatibleFabric.set(fabric_ids)
#     #     return color

#     # def update(self, instance, validated_data):
#     #     fabric_ids = validated_data.pop("compatibleFabric_ids", None)

#     #     for attr, val in validated_data.items():
#     #         setattr(instance, attr, val)
#     #     instance.save()

#     #     if fabric_ids is not None:
#     #         instance.compatibleFabric.set(fabric_ids)

#     #     return instance


class ColorsSerializer(serializers.ModelSerializer):
    compatibleFabric = serializers.ListField(
        child=serializers.ChoiceField(choices=Colors.MATERIAL_CHOICES), 
        required=True
    )

    class Meta:
        model = Colors
        fields = [
            "id",
            "colorName",
            "colorCode",
            "compatibleFabric",
            "isActive",
            "isDeleted",
            "created_at",
            "updated_at"
        ]

    def validate_compatibleFabric(self, value):
        if len(value) == 0:
            raise serializers.ValidationError("Please select at least one fabric.")
        return value

    def validate_colorName(self, value):
        if Colors.objects.filter(colorName__iexact=value, isDeleted=False).exists():
            raise serializers.ValidationError("This color name already exists.")
        return value


class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = "__all__"



class BlogSerializer(serializers.ModelSerializer):
    categoryName = serializers.CharField(
        source="category.categoryName",
        read_only=True
    )

    #  WRITE image to DB
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
            "type",
            "image",        #  ONLY ONE image field
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
        fields = ["id", "title","type", "descriptions", "isActive", "created_at", "updated_at"]

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
            "type", 
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
            "type", 
            "order",
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

class TableThemeSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)

    class Meta:
        model = TableTheme
        fields = [
            'id',
            'title',
            'description',
            'image',
            'order',
            'is_active',
            'isDeleted',
            'created_at',
            'updated_at'
        ]

    def create(self, validated_data):
        if 'is_active' not in self.initial_data:
            validated_data['is_active'] = True
        return super().create(validated_data)

    def update(self, instance, validated_data):
    
        if 'is_active' not in self.initial_data:
            validated_data.pop('is_active', None)
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image and request:
            data['image'] = request.build_absolute_uri(instance.image.url)
        else:
            data['image'] = None
        return data

    
class ProductSerializer(serializers.ModelSerializer):
    isActive = serializers.BooleanField(required=False, default=True)
    
    parts = serializers.PrimaryKeyRelatedField(
        queryset=Parts.objects.filter(isActive=True, isDeleted=False),
        many=True,
        required=False
    )

    theme = serializers.PrimaryKeyRelatedField(
        queryset=TableTheme.objects.filter(is_active=True, isDeleted=False),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Product
        fields = [
            "id", "productName", "slug", "description", "productType","theme", 
            "category", "subcategory", "parts", "price", "discount",
            "total_quantity", "available_quantity",
            "ProductImage", "isActive", "created_at"
        ]
        read_only_fields = ["slug", "created_at"]

    # IMPORTANT: handle parts = "[1,2,3]" from form-data
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
    def validate_productName(self, value):
        queryset = Product.objects.filter(
            productName__iexact=value,
            isDeleted=False
        )

        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)

        if queryset.exists():
            raise serializers.ValidationError(
                "Product with this name already exists."
            )

        return value
    
    
    
    def validate(self, data):
        product_type = data.get("productType")

        # Explicitly check if theme was sent in payload
        theme_provided = "theme" in self.initial_data
        theme_value = data.get("theme")

        # Category → Subcategory validation
        category = data.get("category")
        subcategory = data.get("subcategory")
        if subcategory and subcategory.category != category:
            raise serializers.ValidationError({
                "subcategory": "Selected subcategory does not belong to selected category"
            })

        # Quantity validation
        total_qty = data.get("total_quantity", 0)
        avail_qty = data.get("available_quantity", 0)
        if avail_qty > total_qty:
            raise serializers.ValidationError({
                "available_quantity": "Available quantity cannot exceed total quantity"
            })

        # FINAL THEME RULES (CORRECT)
        if product_type == "table" and not theme_value:
            raise serializers.ValidationError({
                "theme": "Theme is required when product type is table."
            })

        if product_type == "uniform" and theme_provided:
            raise serializers.ValidationError({
                "theme": "Theme is not allowed for uniform products."
            })

        return data

    
    
    
    

class SpecialConditionSerializer(serializers.ModelSerializer):
    discount_percentage = serializers.DecimalField(
        max_digits=5,
        decimal_places=2
    )

    class Meta:
        model = SpecialCondition
        fields = [
            "id",
            "title",
            "condition_type",
            "description",
            "discount_percentage",
            "priority_support",
            "net_30_terms",
            "free_samples",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_discount_percentage(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "Discount percentage must be between 0 and 100."
            )
        return value
    

class SpecialConditionSerializer(serializers.ModelSerializer):
    discount_percentage = serializers.DecimalField(
        max_digits=5,
        decimal_places=2
    )

    class Meta:
        model = SpecialCondition
        fields = [
            "id",
            "title",
            "condition_type",
            "description",
            "discount_percentage",
            "priority_support",
            "net_30_terms",
            "free_samples",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")


class PromocodeSerializer(serializers.ModelSerializer):
    promocodeName = serializers.CharField(
        required=True,
        error_messages={
            "required": "Promocode name is required.",
            "blank": "Promocode name cannot be blank."
        }
    )

    promocodeType = serializers.ChoiceField(
        choices=Promocode.PROMOCODE_TYPE_CHOICES,
        required=True,
        error_messages={
            "required": "Promocode type is required.",
            "invalid_choice": "Invalid promocode type."
        }
    )

    promocodeImage = serializers.ImageField(required=False)

    class Meta:
        model = Promocode
        fields = "__all__"
        read_only_fields = ("slug", "created_at", "updated_at")

    def validate(self, data):
        promocode_type = data.get(
            "promocodeType",
            self.instance.promocodeType if self.instance else None
        )
        amount = data.get(
            "amount",
            self.instance.amount if self.instance else None
        )

        #  SINGLE amount field handling
        if promocode_type == "fix_price":
            if amount is None or amount <= 0:
                raise serializers.ValidationError(
                    "Amount must be greater than 0 for fix price promocode."
                )

        elif promocode_type == "discount":
            if amount is None:
                raise serializers.ValidationError(
                    "Amount (percentage) is required for discount promocode."
                )
            if amount <= 0 or amount >= 100:
                raise serializers.ValidationError(
                    "Discount percentage must be between 1 and 99."
                )

        else:
            raise serializers.ValidationError("Invalid promocode type.")

        started_at = data.get(
            "started_at",
            self.instance.started_at if self.instance else None
        )
        ended_at = data.get(
            "ended_at",
            self.instance.ended_at if self.instance else None
        )

        if started_at and ended_at and started_at >= ended_at:
            raise serializers.ValidationError(
                "Ended date must be greater than started date."
            )

        return data

    def validate_promocodeName(self, value):
        qs = Promocode.objects.filter(
            promocodeName__iexact=value,
            isDeleted=False
        )
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError(
                "Promocode with this name already exists."
            )
        return value


    def create(self, validated_data):
        # HARD FIX for multipart BooleanField issue
        if "isActive" in validated_data and validated_data["isActive"] is False:
            validated_data.pop("isActive")

        validated_data["isActive"] = True
        return super().create(validated_data)



class PrivacyPolicySerializer(serializers.ModelSerializer):

    title = serializers.CharField(
        required=True,
        error_messages={
            "required": "Title is required.",
            "blank": "Title cannot be blank."
        }
    )

    #  ADD THIS (required field)
    privacyPolicyType = serializers.CharField(
        required=True,
        error_messages={
            "required": "privacyPolicyType is required.",
            "blank": "privacyPolicyType cannot be blank."
        }
    )

    #  ADD THIS (required field)
    type = serializers.CharField(
        required=True,
        error_messages={
            "required": "type is required.",
            "blank": "type cannot be blank."
        }
    )

    class Meta:
        model = PrivacyPolicy
        fields = "__all__"
        read_only_fields = ("slug", "created_at", "updated_at")

    def validate_title(self, value):
        qs = PrivacyPolicy.objects.filter(
            title__iexact=value,
            isDeleted=False
        )
        if self.instance:
            qs = qs.exclude(id=self.instance.id)

        if qs.exists():
            # MUST BE STRING (NOT DICT)
            raise serializers.ValidationError(
                "title with this name already exists."
            )

        return value

    def validate(self, data):
        if not data.get("content"):
            raise serializers.ValidationError(
                "Content is required."
            )
        if not data.get("language"):
            raise serializers.ValidationError(
                "Language is required."
            )
        if not data.get("version"):
            raise serializers.ValidationError(
                "Version is required."
            )
        return data

    # Fix multipart boolean issue
    def create(self, validated_data):
        validated_data["isActive"] = True
        return super().create(validated_data)



class QuotationTemplateSerializer(serializers.ModelSerializer):

    class Meta:
        model = QuotationTemplate
        fields = [
            "id",
            "title",
            "slug",
            "content",
            "userType",
            "language",
            "version",
            "is_active",
            "is_deleted",
            "created_at",
            "updated_at",]

        read_only_fields = ("id","userType","created_at","updated_at",)


class AdminNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminNotification
        fields = "__all__"
        
        
class UnitPriceSerializer(serializers.Serializer):
    type = serializers.CharField()
    itemName = serializers.CharField()
    unit = serializers.CharField()
    basePrice = serializers.DecimalField(max_digits=10, decimal_places=2)
    bulk = serializers.DecimalField(max_digits=10, decimal_places=2)
    action = serializers.CharField()

#<====================B2B=========================>


class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    role_name = serializers.CharField(source="Role.role_name", read_only=True)
    class Meta:
        model = AdminUser
        fields = [
            "id",
            "name",
            "company_name",
            "email",
            "mobile",
            "role_name",
            "last_login",
            "tier",
            "password",
            "is_active",
            "created_at",
            "is_currently_login",
        ]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        password = validated_data.pop("password")

        validated_data["role"] = get_default_b2b_role()
        validated_data["is_staff"] = False

        user = AdminUser.objects.create_user(
            password=password,
            **validated_data
        )
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance
    def get_is_currently_login(self, obj):
        if not obj.lastLogin:
            return False
        active_window = timezone.now() - timedelta(minutes=30)
        return obj.lastLogin >= active_window

   
   
# class AdminOrderUpdateSerializer(serializers.ModelSerializer):
#     admin_cancel_reason = serializers.CharField(required=False, allow_blank=True)

#     class Meta:
#         model = Order
#         fields = ['status', 'admin_cancel_reason']

#     def validate(self, attrs):
#         order = self.instance
#         new_status = attrs.get('status', None)

#         if order.status in ['completed', 'paid']:
#             raise serializers.ValidationError("Cannot update order because it is already completed or paid.")

#         if new_status == 'cancelled' and not attrs.get('admin_cancel_reason'):
#             raise serializers.ValidationError("Admin cancel reason is required when cancelling an order.")
        
#         return attrs


class AdminRefundSerializer(serializers.ModelSerializer):
    order_id = serializers.CharField(source='order.order_id', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    payment_id = serializers.CharField(source='payment.payment_id', read_only=True)

    class Meta:
        model = Refund
        fields = [
            'id',
            'order',
            'order_id',
            'payment',
            'payment_id',
            'user',
            'user_name',
            'refund_amount',
            'reason',
            'status',
            'admin_note',
            'refund_method',
            'payment_gateway_id',
            'currency',
            'created_at',
            'processed_at',
        ]
        read_only_fields = [
            'id',
            'order',
            'user',
            'payment',
            'created_at',
            'processed_at',
            'payment_id',
            'order_id',
            'user_name'
        ]

    def validate_refund_amount(self, value):
       
        if self.instance and self.instance.payment:
            max_amount = self.instance.payment.amount
            if value <= 0:
                raise serializers.ValidationError("Refund amount must be greater than zero.")
            if value > max_amount:
                raise serializers.ValidationError(f"Refund amount cannot exceed paid amount ({max_amount}).")
        return value
    
class UserListSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    lastLogin = serializers.SerializerMethodField()  


    class Meta:
        model = Users
        fields = [
            'id', 'email', 'userType', 'phone', 'userName', 'firstName', 'lastName',
            'language', 'gender', 'profileImage', 'role', 'lastLogin', 'isActive',
            'loginType', 'email_notifications', 'push_notifications', 'is_verify',
            'createdAt', 'updatedAt','is_currently_login'
        ]

    def get_role(self, obj):
        return obj.role.role_name if obj.role else None

    def get_lastLogin(self, obj):
        if obj.lastLogin:
            return obj.lastLogin.strftime("%Y-%m-%d %H:%M:%S")
        return "Never logged in"
    def get_is_currently_login(self, obj):
        if not obj.lastLogin:
            return False
        active_window = timezone.now() - timedelta(minutes=30)
        return obj.lastLogin >= active_window



class OrderUpdateSerializer(serializers.ModelSerializer):
    customer = serializers.SerializerMethodField()
    payment = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = "__all__"
       
    def validate(self, attrs):

        order = self.instance
        new_status = attrs.get("status", order.status)
        if order.status == "cancelled" and new_status == "cancelled":

            raise serializers.ValidationError("Order already cancelled")
        if new_status == "cancelled" and order.status in [
            "out_for_delivery",
            "delivered"

        ]:
            raise serializers.ValidationError(
                "Order cannot be cancelled after Out For Delivery or Delivered"
            )
        if order.status == new_status and new_status in [
            "out_for_delivery",
            "delivered"
        ]:
            raise serializers.ValidationError(
                f"Order already marked as {new_status.replace('_', ' ').title()}"
            )
        return attrs
    def update(self, instance, validated_data):
        if validated_data.get("status") == "cancelled":
            instance.cancelled_by = "admin"
        return super().update(instance, validated_data)
    
    def get_customer(self, obj):
        if not obj.user:  # check if user exists
            return None
        try:
            customer = obj.user.customerdetails
            return {
            "full_name": f"{customer.first_name} {customer.last_name}",
                        "email": customer.email,
                        "address": {
                            "address_line_1": customer.address_line_1,
                            "address_line_2": customer.address_line_2,
                            "city": customer.city,
                            "postal_code": customer.postal_code,
                            "country": customer.country
                        }
                    }
        except CustomerDetails.DoesNotExist:
                return None

 
    def get_payment(self, obj):
        payment = Payment.objects.filter(order=obj).first()
        if payment:
            return {
                "payment_id": payment.payment_id,
                "payment_method": payment.payment_method,
                "payment_status": payment.payment_status
            }
        return None

  

 