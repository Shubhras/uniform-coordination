from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from django.conf import settings
import json
import re
from django.utils import timezone
from .models import *
from datetime import timedelta
from .utils import get_default_b2b_role, new_build_media_url
from userhub.models import *
# User = get_user_model()
import json
# from userhub.models import Order


def build_media_url(file_field):
    """
    Returns absolute media URL for a FileField/ImageField
    Works without request object
    """
    if not file_field:
        return None

    return f"{settings.SITE_DOMAIN}{settings.MEDIA_URL}{file_field.name}"


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



class UpdateChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context["request"].user

        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")

        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "New password and confirm password do not match."
            })

        if len(attrs["new_password"]) < 8:
            raise serializers.ValidationError({
                "new_password": "Password must be at least 8 characters long."
            })

        return attrs

class ChangePasswordSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "New password and confirm password do not match."
            })
        return attrs

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


class CategoryMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "categoryName", "type", "slug"]


class SubCategoryMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ["id", "name", "slug"]


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = [
            "id",
            "role_name",
            "slug",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]

class FabricSerializer(serializers.ModelSerializer):
    theme = serializers.PrimaryKeyRelatedField(
        queryset=TableTheme.objects.filter(is_active=True, isDeleted=False),
        required=False,
        allow_null=True
    )
    category = CategoryMiniSerializer(read_only=True)
    subcategory = SubCategoryMiniSerializer(read_only=True)

    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(isActive=True, isDeleted=False),
        source="category",
        write_only=True,
        required=False,
        allow_null=True
    )
    subcategory_id = serializers.PrimaryKeyRelatedField(
        queryset=SubCategory.objects.filter(isActive=True, isDeleted=False),
        source="subcategory",
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Fabric
        fields = '__all__'

    def validate(self, data):
        fabric_type = data.get("fabricType")
        if fabric_type is None and self.instance:
            fabric_type = self.instance.fabricType

        theme = data.get("theme")
        if "theme" not in data and self.instance:
            theme = self.instance.theme

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

        category = data.get("category")
        if "category" not in data and self.instance:
            category = self.instance.category

        subcategory = data.get("subcategory")
        if "subcategory" not in data and self.instance:
            subcategory = self.instance.subcategory

        if subcategory and category and subcategory.category != category:
            raise serializers.ValidationError({
                "subcategory": "Selected subcategory does not belong to selected category"
            })

        return data





class PartsSerializer(serializers.ModelSerializer):
    theme = serializers.PrimaryKeyRelatedField(
        queryset=TableTheme.objects.filter(is_active=True, isDeleted=False),
        required=False,
        allow_null=True
    )
    category = CategoryMiniSerializer(read_only=True)
    subcategory = SubCategoryMiniSerializer(read_only=True)

    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(isActive=True, isDeleted=False),
        source="category",
        write_only=True,
        required=False,
        allow_null=True
    )
    subcategory_id = serializers.PrimaryKeyRelatedField(
        queryset=SubCategory.objects.filter(isActive=True, isDeleted=False),
        source="subcategory",
        write_only=True,
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

        # Category -> Subcategory validation
        category = data.get("category")
        if "category" not in data and self.instance:
            category = self.instance.category

        subcategory = data.get("subcategory")
        if "subcategory" not in data and self.instance:
            subcategory = self.instance.subcategory

        if subcategory and category and subcategory.category != category:
            raise serializers.ValidationError({
                "subcategory": "Selected subcategory does not belong to selected category"
            })

        return data
    
    def create(self, validated_data):
        if "isActive" not in self.initial_data:
            validated_data["isActive"] = True
        return super().create(validated_data)





class FabricMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fabric
        fields = ["id", "fabricName"]




class SystemSettingsSerializer(serializers.ModelSerializer):
    # Write-only: an admin can set the SMTP password but it is never returned,
    # so it cannot leak through the settings GET.
    email_password = serializers.CharField(
        write_only=True, required=False, allow_blank=True, allow_null=True
    )
    # Lets the UI show "configured / not configured" without exposing the value.
    email_password_set = serializers.SerializerMethodField()

    def get_email_password_set(self, obj):
        return bool(obj.email_password)

    class Meta:
        model = SystemSettings
        fields = [
            'company_name',
            'business_address',
            'support_email',
            'contact_number',
            'default_language',
            'default_currency',
            'time_zone',
            'date_format',
            'logo',

            # Payment & Billing Terms tab
            'payment_terms',
            'quotation_validity_days',
            'tax_rate',
            'tax_inclusive',
            'bank_name',
            'bank_branch',
            'bank_account_name',
            'bank_account_number',

            # Email & Notifications tab
            'email_host',
            'email_port',
            'email_use_tls',
            'email_username',
            'email_password',
            'email_password_set',
            'email_sender_name',
            'email_sender_address',
            'email_reply_to',
            'email_footer_note',
            'admin_notification_emails',
            'notify_admin_on_new_request',
            'notify_customer_on_registration',
            'notify_customer_on_request_received',
            'notify_customer_on_status_change',

            'updated_at',
        ]
        read_only_fields = ['updated_at']
        

class CustomerListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.CharField(source="role.role_name", read_only=True)

    class Meta:
        model = Users
        fields = [
            "id",
            "userName",
            "firstName",
            "lastName",
            "full_name",
            "email",
            "phone",
            "userType",
            "gender",
            "loginType",
            "is_verify",
            "isActive",
            "profileImage",
            "role",
            "createdAt",
        ]

    def get_full_name(self, obj):
        return f"{obj.firstName or ''} {obj.lastName or ''}".strip()
    


class CustomerDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role_name = serializers.CharField(source="role.role_name", read_only=True)

    class Meta:
        model = Users
        fields = [
            "id",
            "userName",
            "firstName",
            "lastName",
            "full_name",
            "email",
            "phone",
            "userType",
            "gender",
            "language",
            "profileImage",
            "loginType",
            "appleID",
            "stripeOrderCustomerId",
            "email_notifications",
            "push_notifications",
            "is_verify",
            "isActive",
            "is_currently_login",
            "role_name",
            "lastLogin",
            "createdAt",
            "updatedAt",
        ]

    def get_full_name(self, obj):
        return f"{obj.firstName or ''} {obj.lastName or ''}".strip()    

class CustomerUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = [
            "userName",
            "firstName",
            "lastName",
            "email",
            "phone",
            "userType",
            "gender",
            "language",
            "profileImage",
            "is_verify",
            "isActive",
            "email_notifications",
            "push_notifications",
        ]

    def validate_email(self, value):
        if value:
            qs = Users.objects.filter(email=value).exclude(id=self.instance.id)
            if qs.exists():
                raise serializers.ValidationError(
                    "A user with this email already exists."
                )
        return value

    def validate_phone(self, value):
        if value:
            qs = Users.objects.filter(phone=value).exclude(id=self.instance.id)
            if qs.exists():
                raise serializers.ValidationError(
                    "A user with this phone number already exists."
                )
        return value
    
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


class SpecificationListField(serializers.Field):
    """
    A list of short bullet strings that also accepts a JSON-encoded string.

    The admin template form is multipart because it uploads an image, so this value
    arrives as text rather than a parsed array.
    """

    def to_representation(self, value):
        return value or []

    def to_internal_value(self, data):
        if isinstance(data, str):
            text = data.strip()
            if not text:
                return []
            try:
                data = json.loads(text)
            except ValueError:
                raise serializers.ValidationError(
                    "Must be a JSON array of strings."
                )

        if not isinstance(data, list):
            raise serializers.ValidationError("Must be a list of strings.")

        cleaned = [str(item).strip() for item in data if str(item).strip()]
        if len(cleaned) > 10:
            raise serializers.ValidationError(
                "A template can have at most 10 specification lines."
            )
        return cleaned


class AttributeOptionSerializer(serializers.ModelSerializer):
    """
    One choice for one simulation attribute. `image` is returned as an absolute URL and
    accepted as an upload under the same name, so the admin form has nothing to translate.
    """

    categoryName = serializers.CharField(
        source="category.categoryName", read_only=True
    )
    attributeLabel = serializers.CharField(
        source="get_attribute_display", read_only=True
    )
    imageUrl = serializers.SerializerMethodField()

    class Meta:
        model = AttributeOption
        fields = [
            "id", "attribute", "attributeLabel", "name",
            "image", "imageUrl",
            "category", "categoryName",
            "order", "isActive", "isDeleted",
            "created_at", "updated_at",
        ]
        read_only_fields = ["isDeleted", "created_at", "updated_at"]
        extra_kwargs = {"image": {"write_only": True, "required": False}}

    def get_imageUrl(self, obj):
        return new_build_media_url(obj.image)

    def validate(self, attrs):
        attribute = attrs.get("attribute") or getattr(self.instance, "attribute", None)
        image = attrs.get("image", getattr(self.instance, "image", None))

        # Size is a run of labels with nothing to picture; every other attribute is
        # chosen from artwork, so an option with no image would render as a blank tile.
        if attribute and attribute != "size" and not image:
            raise serializers.ValidationError(
                {"image": "An image is required for this attribute."}
            )

        return attrs


class TemplateSerializer(serializers.ModelSerializer):
    partName = serializers.CharField(source='part.partName',read_only=True)
    partCategory = serializers.CharField(source='part.category',read_only=True)
    # The industry category, distinct from partCategory above — that one is the part's
    # own grouping (Pockets, Caps) and is not what the storefront pages filter on.
    categoryName = serializers.CharField(
        source='category.categoryName', read_only=True
    )
    # The style this template pre-selects in the design tool. Names and the colour code
    # travel with it so the storefront can show what a template applies without a second
    # round of lookups.
    presetColorName = serializers.CharField(
        source='preset_color.colorName', read_only=True
    )
    presetColorCode = serializers.CharField(
        source='preset_color.colorCode', read_only=True
    )
    presetFabricName = serializers.CharField(
        source='preset_fabric.fabricName', read_only=True
    )
    presetPartName = serializers.CharField(
        source='part.partName', read_only=True
    )
    specifications = SpecificationListField(required=False)

    class Meta:
        model = Template
        fields = "__all__"
    
    def create(self, validated_data):
        if "isActive" not in self.initial_data:
            validated_data["isActive"] = True
        return super().create(validated_data)
    
    def validate_templateName(self, value):
        qs = Template.objects.filter(templateName__iexact=value)

        if self.instance:
            qs = qs.exclude(id=self.instance.id)

        if qs.exists():
            raise serializers.ValidationError(
                "Template with this name already exists."
            )

        return value


# correct 
# class BlogSerializer(serializers.ModelSerializer):
#     categoryName = serializers.CharField(
#         source="category.categoryName",
#         read_only=True
#     )

#     #  WRITE image to DB
#     image = serializers.ImageField(required=False, allow_null=True)
#     slug = serializers.SerializerMethodField()
#     isActive = serializers.BooleanField(default=True)

#     class Meta:
#         model = Blog
#         fields = [
#             "id",
#             "title",
#             "slug",
#             "category",
#             "categoryName",
#             "type",
#             "image",        #  ONLY ONE image field
#             "description",
#             "isActive",
#             "created_at",
#             "updated_at",
#         ]

#     # -----------------------------
#     # Replace dash (-) with underscore (_)
#     # -----------------------------
#     def get_slug(self, obj):
#         if obj.slug:
#             return obj.slug.replace("-", "_")
#         return None

#     # -----------------------------
#     # Return ABSOLUTE image URL using SAME field
#     # -----------------------------
#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         request = self.context.get("request")

#         if instance.image:
#             image_name = instance.image.name
#             if image_name.startswith("http://") or image_name.startswith("https://"):
#                 data["image"] = image_name
#             elif request:
#                 data["image"] = request.build_absolute_uri(instance.image.url)
#             else:
#                 data["image"] = instance.image.url
#         else:
#             data["image"] = None

#         return data

#     # def validate_title(self, value):
#     #     if not value.strip():
#     #         raise serializers.ValidationError("Title is required.")
#     #     return value

#     def validate_title(self, value):
#         qs = Blog.objects.filter(title__iexact=value,isDeleted=False)
#         if self.instance:
#             qs = qs.exclude(id=self.instance.id)

#         if qs.exists():
#             raise serializers.ValidationError("Blog with this title already exists.")

#         return value

# for new url /////////////////////////////

class BlogSerializer(serializers.ModelSerializer):
    categoryName = serializers.CharField(
        source="category.categoryName",
        read_only=True
    )

    image = serializers.ImageField(required=False, allow_null=True, write_only=True)
    image_url = serializers.SerializerMethodField(read_only=True)

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
            "image",        # For upload only
            "image_url",    # For response
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
    # Return image URL
    # -----------------------------
    def get_image_url(self, obj):
        return build_media_url(obj.image)

    # -----------------------------
    # Validate title
    # -----------------------------
    def validate_title(self, value):
        qs = Blog.objects.filter(
            title__iexact=value,
            isDeleted=False
        )

        if self.instance:
            qs = qs.exclude(id=self.instance.id)

        if qs.exists():
            raise serializers.ValidationError(
                "Blog with this title already exists."
            )

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
    isActive = serializers.BooleanField(default=True)
    class Meta:
        model = Category
        fields = [
            "id",
            "categoryName",
            "slug",
            "type",
            "categoryImage",
            "bannerImage",
            "description",
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
    category_name = serializers.CharField(
        source="category.categoryName",
        read_only=True
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
            "category_name",
            "description",
            "isActive",
            "isDeleted",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("slug",)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")

        if instance.image:
            image_name = instance.image.name
            if image_name.startswith("http://") or image_name.startswith("https://"):
                data["image"] = image_name
            elif request:
                data["image"] = request.build_absolute_uri(instance.image.url)
            else:
                data["image"] = instance.image.url
        else:
            data["image"] = None

        return data

    def validate_name(self, value):
        qs = CatalogImage.objects.filter(name__iexact=value, isDeleted=False)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)

        if qs.exists():
            raise serializers.ValidationError(
                "Catalog Image with this Name already exists."
            )
        return value





# class SubCategorySerializer(serializers.ModelSerializer):
#     category_name = serializers.CharField(source="category.categoryName",read_only=True)
#     class Meta:
#         model = SubCategory
#         fields = [            
#             "id",
#             "name",
#             "category",
#             "category_name",           
#             "subcategoryImage",
#             "slug",
#             "type", 
#             "order",
#             "description",
#             "isActive",
#             "isDeleted",
#             "created_at",
#             "updated_at"
#         ]
#         read_only_fields = ("id", "created_at", "updated_at")

#     def validate(self, attrs):
#         name = attrs.get("name")
#         category = attrs.get("category")

#         if name and category:
#             exists = SubCategory.objects.filter(
#                 name__iexact=name,
#                 category=category,
#                 isDeleted=False
#             ).exists()

#             if exists:
#                 raise serializers.ValidationError({
#                     "name": "Validation Failed;subcategory with this name already exists in this category."
#                 })

#         return attrs



# class SubCategorySerializer(serializers.ModelSerializer):
#     category_name = serializers.CharField(
#         source="category.categoryName",
#         read_only=True
#     )
#     subcategoryImage = serializers.SerializerMethodField()

#     class Meta:
#         model = SubCategory
#         fields = [
#             "id",
#             "name",
#             "category",
#             "category_name",
#             "subcategoryImage",
#             "slug",
#             "type",
#             "order",
#             "description",
#             "isActive",
#             "isDeleted",
#             "created_at",
#             "updated_at",
#         ]
#         read_only_fields = ("id", "created_at", "updated_at")

#     def get_subcategoryImage(self, obj):
#         if not obj.subcategoryImage:
#             return None

#         # External URL (e.g. Unsplash)
#         if obj.subcategoryImage.name.startswith(("http://", "https://")):
#             return obj.subcategoryImage.name

#         return f"{settings.SITE_URL}{obj.subcategoryImage.url}"

#     def validate(self, attrs):
#         name = attrs.get("name")
#         category = attrs.get("category")

#         if name and category:
#             exists = SubCategory.objects.filter(
#                 name__iexact=name,
#                 category=category,
#                 isDeleted=False
#             ).exclude(
#                 pk=self.instance.pk if self.instance else None
#             ).exists()

#             if exists:
#                 raise serializers.ValidationError({
#                     "name": "Validation Failed; subcategory with this name already exists in this category."
#                 })

#         return attrs


class SubCategorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source="category.categoryName",
        read_only=True
    )

    # Same key for upload and response
    subcategoryImage = serializers.ImageField(
        required=False,
        allow_null=True
    )

    class Meta:
        model = SubCategory
        fields = [
            "id",
            "name",
            "category",
            "category_name",
            "subcategoryImage",
            "slug",
            "type",
            "order",
            "description",
            "isActive",
            "isDeleted",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if instance.subcategoryImage:
            if instance.subcategoryImage.name.startswith(("http://", "https://")):
                data["subcategoryImage"] = instance.subcategoryImage.name
            else:
                data["subcategoryImage"] = (
                    f"{settings.SITE_URL}{instance.subcategoryImage.url}"
                )
        else:
            data["subcategoryImage"] = None

        return data

    def validate(self, attrs):
        name = attrs.get("name", self.instance.name if self.instance else None)
        category = attrs.get("category", self.instance.category if self.instance else None)

        exists = SubCategory.objects.filter(
            name__iexact=name,
            category=category,
            isDeleted=False
        )

        if self.instance:
            exists = exists.exclude(pk=self.instance.pk)

        if exists.exists():
            raise serializers.ValidationError({
                "name": "Validation Failed; subcategory with this name already exists in this category."
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
    
    def validate_title(self,value):
        qs = TableTheme.objects.filter(title__iexact=value,isDeleted=False)
        if self.instance:
             qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError(
                "Catalog Image with this Name already exists."
            )

        return value
    

    
# class ProductSerializer(serializers.ModelSerializer):
#     parts = serializers.PrimaryKeyRelatedField(
#         queryset=Parts.objects.filter(isActive=True, isDeleted=False),
#         many=True,
#         required=False
#     )

#     theme = serializers.PrimaryKeyRelatedField(
#         queryset=TableTheme.objects.filter(is_active=True, isDeleted=False),
#         required=False,
#         allow_null=True
#     )

#     class Meta:
#         model = Product
#         fields = [
#             "id", "productName", "slug", "description", "productType","theme", 
#             "category", "subcategory", "parts", "price", "discount",
#             "total_quantity", "available_quantity",
#             "ProductImage", "isActive", "created_at"
#         ]
#         read_only_fields = ["slug", "created_at"]

#     # IMPORTANT: handle parts = "[1,2,3]" from form-data
#     def to_internal_value(self, data):
#         data = data.copy()

#         parts = data.get("parts")
#         if parts and isinstance(parts, str):
#             try:
#                 data.setlist("parts", json.loads(parts))
#             except (json.JSONDecodeError, TypeError):
#                 raise serializers.ValidationError({
#                     "parts": "Invalid format. Use [1,2,3]."
#                 })

#         return super().to_internal_value(data)
    
#     def validate(self, data):
#         product_type = data.get("productType")

#         # Explicitly check if theme was sent in payload
#         theme_provided = "theme" in self.initial_data
#         theme_value = data.get("theme")

#         # Category → Subcategory validation
#         category = data.get("category")
#         subcategory = data.get("subcategory")
#         if subcategory and subcategory.category != category:
#             raise serializers.ValidationError({
#                 "subcategory": "Selected subcategory does not belong to selected category"
#             })

#         # Quantity validation
#         total_qty = data.get("total_quantity", 0)
#         avail_qty = data.get("available_quantity", 0)
#         if avail_qty > total_qty:
#             raise serializers.ValidationError({
#                 "available_quantity": "Available quantity cannot exceed total quantity"
#             })

#         # FINAL THEME RULES (CORRECT)
#         if product_type == "table" and not theme_value:
#             raise serializers.ValidationError({
#                 "theme": "Theme is required when product type is table."
#             })

#         if product_type == "uniform" and theme_provided:
#             raise serializers.ValidationError({
#                 "theme": "Theme is not allowed for uniform products."
#             })

#         return data


class PartsMiniSerializer(serializers.ModelSerializer):
    category = CategoryMiniSerializer(read_only=True)
    subcategory = SubCategoryMiniSerializer(read_only=True)

    class Meta:
        model = Parts
        fields = ["id", "partName", "category", "subcategory"]

class ProductSerializer(serializers.ModelSerializer):
    isActive = serializers.BooleanField(required=False, default=True)
 
    category = CategoryMiniSerializer(read_only=True)
    subcategory = SubCategoryMiniSerializer(read_only=True)
    parts = PartsMiniSerializer(read_only=True, many=True)
    ProductImage = serializers.SerializerMethodField()  # for response
    ProductImage_file = serializers.ImageField(write_only=True, required=False) 
 
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(isActive=True, isDeleted=False),
        source="category",
        write_only=True,
        required=False
    )
 
    subcategory_id = serializers.PrimaryKeyRelatedField(
        queryset=SubCategory.objects.filter(isActive=True, isDeleted=False),
        source="subcategory",
        write_only=True,
        required=False
    )
 
    parts_ids = serializers.PrimaryKeyRelatedField(
        queryset=Parts.objects.filter(isActive=True, isDeleted=False),
        source="parts",
        many=True,
        write_only=True,
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
            "id", "productName", "slug", "description", "productType",
            "theme",
            "type",

            # READ
            "category", "subcategory", "parts", "ProductImage",

            # WRITE
            "category_id", "subcategory_id", "parts_ids", "ProductImage_file",

            "price", "discount", "total_quantity", "available_quantity",
            "isActive", "created_at","rental_price_per_day", "security_deposit",

            # Whether the customer simulation offers this product — managed under
            # Simulation Assets → Product Visibility.
            "show_in_simulation",
]

    # This serializer reads and writes its relations under different names: `category`,
    # `subcategory`, `parts` and `ProductImage` are the read shapes (nested objects and a
    # built URL) and so are read-only, while writes go through `category_id`,
    # `subcategory_id`, `parts_ids` and `ProductImage_file`.
    #
    # Both admin front-ends post the read names. A read-only field raises no error when
    # supplied, so every one of those values was dropped in silence — products saved with
    # no category, no subcategory and no image, and the edit form then had nothing to
    # prefill. Accepting the read names as aliases fixes the callers as they stand.
    WRITE_ALIASES = {
        "category": "category_id",
        "subcategory": "subcategory_id",
        "parts": "parts_ids",
        "ProductImage": "ProductImage_file",
    }

    def to_internal_value(self, data):
        data = data.copy()

        for sent, expected in self.WRITE_ALIASES.items():
            # An explicit `category_id` always wins; the alias only fills a gap.
            if sent in data and not data.get(expected):
                value = data.get(sent)
                # Skip a read shape echoed back — a nested dict, or an image URL string
                # where an upload belongs. Neither is something to write from.
                if isinstance(value, dict):
                    continue
                if expected == "ProductImage_file" and isinstance(value, str):
                    continue
                data[expected] = value

        parts = data.get("parts_ids")
        if parts and isinstance(parts, str):
            try:
                parsed = json.loads(parts)
            except (json.JSONDecodeError, TypeError):
                raise serializers.ValidationError({
                    "parts_ids": "Invalid format. Use [1,2,3]."
                })
            # setlist exists on QueryDict (form posts); JSON requests give a plain dict.
            if hasattr(data, "setlist"):
                data.setlist("parts_ids", parsed)
            else:
                data["parts_ids"] = parsed

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
    
    def get_ProductImage(self, obj):
        return new_build_media_url(obj.ProductImage)
    
    
    
    def validate(self, data):
        product_type = data.get("productType")
 
        theme_provided = "theme" in self.initial_data
        theme_value = data.get("theme")
 
        category = data.get("category")
        subcategory = data.get("subcategory")
 
        if subcategory and category and subcategory.category != category:
            raise serializers.ValidationError({
                "subcategory": "Selected subcategory does not belong to selected category"
            })
 
        total_qty = data.get("total_quantity", 0)
        avail_qty = data.get("available_quantity", 0)
 
        if avail_qty > total_qty:
            raise serializers.ValidationError({
                "available_quantity": "Available quantity cannot exceed total quantity"
            })
 
        if product_type == "table" and not theme_value:
            raise serializers.ValidationError({
                "theme": "Theme is required when product type is table."
            })
 
        if product_type == "uniform" and theme_provided:
            raise serializers.ValidationError({
                "theme": "Theme is not allowed for uniform products."
            })
 
        return data
        read_only_fields = ["slug", "created_at"]

    def get_ProductImage(self, obj):
        if obj.ProductImage:
            return build_media_url(obj.ProductImage)
        return None

    def create(self, validated_data):
        image = validated_data.pop('ProductImage_file', None)
        product = super().create(validated_data)
        if image:
            product.ProductImage = image
            product.save()
        return product

    # A second copy of to_internal_value used to sit here. Being later in the class body,
    # it silently replaced the one above — so the alias handling never ran.

    def update(self, instance, validated_data):
        image = validated_data.pop("ProductImage_file", None)
        parts = validated_data.pop("parts", None)

        # Update normal fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Update image
        if image is not None:
            instance.ProductImage = image

        instance.save()

        # Update ManyToMany
        if parts is not None:
            instance.parts.set(parts)

        return instance
 
    
    def validate(self, data):
        product_type = data.get("productType")
 
        theme_provided = "theme" in self.initial_data
        theme_value = data.get("theme")
 
        category = data.get("category")
        subcategory = data.get("subcategory")
 
        if subcategory and category and subcategory.category != category:
            raise serializers.ValidationError({
                "subcategory": "Selected subcategory does not belong to selected category"
            })
 
        total_qty = data.get("total_quantity", 0)
        avail_qty = data.get("available_quantity", 0)
 
        if avail_qty > total_qty:
            raise serializers.ValidationError({
                "available_quantity": "Available quantity cannot exceed total quantity"
            })
 
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
    bulk = serializers.DecimalField(max_digits=10, decimal_places=2,allow_null=True)
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


class AdminSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = AdminUser
        fields = [
            "id",
            "name",
            "company_name",
            "email",
            "mobile",
            "tier",
            "password",
            "is_active",
            "language",
        ]
        read_only_fields = ["id"]

    def validate_email(self, value):
        if AdminUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An admin user with this email already exists.")
        return value

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long.")
        if not re.search(r"[A-Za-z]", value):
            raise serializers.ValidationError("Password must contain at least one letter.")
        if not re.search(r"[0-9]", value):
            raise serializers.ValidationError("Password must contain at least one number.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise serializers.ValidationError("Password must contain at least one special character like @,#,$.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")

        admin_role, _ = Role.objects.get_or_create(
            role_name="admin",
            defaults={
                "slug": "admin",
                "description": "Admin role with full access"
            }
        )

        validated_data["role"] = admin_role
        validated_data["is_staff"] = True

        user = AdminUser.objects.create_user(
            password=password,
            **validated_data
        )
        return user




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
        # fields admin can update + fields for nested info
        fields = '__all__'

    def validate(self, attrs):
        order = self.instance
        new_status = attrs.get("status", order.status)
        if order.status == "cancelled" and new_status == "cancelled":
            raise serializers.ValidationError("Order already cancelled")
        if new_status == "cancelled" and order.status in ["out_for_delivery", "delivered"]:
            raise serializers.ValidationError("Order cannot be cancelled after Out For Delivery or Delivered")
        if order.status == new_status and new_status in ["out_for_delivery", "delivered"]:
            raise serializers.ValidationError(f"Order already marked as {new_status.replace('_', ' ').title()}")
        return attrs

    def update(self, instance, validated_data):
        if validated_data.get("status") == "cancelled":
            instance.cancelled_by = "admin"
        return super().update(instance, validated_data)

    def get_customer(self, obj):
        if not obj.user:
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

# class OrderUpdateSerializer(serializers.ModelSerializer):
#     customer = serializers.SerializerMethodField()
#     payment = serializers.SerializerMethodField()

#     class Meta:
#         model = Order
#         fields = "__all__"
       
#     def validate(self, attrs):

#         order = self.instance
#         new_status = attrs.get("status", order.status)
#         if order.status == "cancelled" and new_status == "cancelled":

#             raise serializers.ValidationError("Order already cancelled")
#         if new_status == "cancelled" and order.status in [
#             "out_for_delivery",
#             "delivered"

#         ]:
#             raise serializers.ValidationError(
#                 "Order cannot be cancelled after Out For Delivery or Delivered"
#             )
#         if order.status == new_status and new_status in [
#             "out_for_delivery",
#             "delivered"
#         ]:
#             raise serializers.ValidationError(
#                 f"Order already marked as {new_status.replace('_', ' ').title()}"
#             )
#         return attrs
#     def update(self, instance, validated_data):
#         if validated_data.get("status") == "cancelled":
#             instance.cancelled_by = "admin"
#         return super().update(instance, validated_data)
    
#     def get_customer(self, obj):
#         if not obj.user: 
#             return None
#         try:
#             customer = obj.user.customerdetails
#             return {
#             "full_name": f"{customer.first_name} {customer.last_name}",
#                         "email": customer.email,
#                         "address": {
#                             "address_line_1": customer.address_line_1,
#                             "address_line_2": customer.address_line_2,
#                             "city": customer.city,
#                             "postal_code": customer.postal_code,
#                             "country": customer.country
#                         }
#                     }
#         except CustomerDetails.DoesNotExist:
#                 return None

 
#     def get_payment(self, obj):
#         payment = Payment.objects.filter(order=obj).first()
#         if payment:
#             return {
#                 "payment_id": payment.payment_id,
#                 "payment_method": payment.payment_method,
#                 "payment_status": payment.payment_status
#             }
#         return None


# --- Menu and SubMenu Serializers ---

class SubMenuSerializer(serializers.ModelSerializer):
    menu_name = serializers.CharField(source="menu.name", read_only=True)

    class Meta:
        model = SubMenu
        fields = [
            "id", "menu", "menu_name", "name", "slug", "route", "order",
            "isActive", "isDeleted", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]

    def validate(self, attrs):
        name = attrs.get("name")
        menu = attrs.get("menu")

        if name and menu:
            # Check unique constraint condition
            qs = SubMenu.objects.filter(name__iexact=name, menu=menu, isDeleted=False)
            if self.instance:
                qs = qs.exclude(id=self.instance.id)
            if qs.exists():
                raise serializers.ValidationError({
                    "name": "A submenu with this name already exists under the selected menu."
                })
        return attrs


class MenuSerializer(serializers.ModelSerializer):
    submenus = serializers.SerializerMethodField()

    class Meta:
        model = Menu
        fields = [
            "id", "name", "slug", "icon", "route", "order", "submenus",
            "isActive", "isDeleted", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]

    def get_submenus(self, obj):
        # Only return active, non-deleted submenus
        active_submenus = obj.submenus.filter(isDeleted=False, isActive=True).order_by("order")
        return SubMenuSerializer(active_submenus, many=True).data

    def validate_name(self, value):
        qs = Menu.objects.filter(name__iexact=value, isDeleted=False)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError("A menu with this name already exists.")
        return value


# --- Role-Based Permission Serializers ---

class RoleMenuPermissionSerializer(serializers.ModelSerializer):
    menu_name = serializers.CharField(source="menu.name", read_only=True)

    class Meta:
        model = RoleMenuPermission
        fields = ["id", "role", "menu", "menu_name", "can_view", "can_create", "can_update", "can_delete"]


class RoleSubMenuPermissionSerializer(serializers.ModelSerializer):
    submenu_name = serializers.CharField(source="submenu.name", read_only=True)

    class Meta:
        model = RoleSubMenuPermission
        fields = ["id", "role", "submenu", "submenu_name", "can_view", "can_create", "can_update", "can_delete"]


class SubMenuPermissionAssignSerializer(serializers.Serializer):
    submenu_id = serializers.PrimaryKeyRelatedField(
        queryset=SubMenu.objects.filter(isDeleted=False, isActive=True)
    )
    can_view = serializers.BooleanField(default=True)
    can_create = serializers.BooleanField(default=False)
    can_update = serializers.BooleanField(default=False)
    can_delete = serializers.BooleanField(default=False)


class MenuPermissionAssignSerializer(serializers.Serializer):
    menu_id = serializers.PrimaryKeyRelatedField(
        queryset=Menu.objects.filter(isDeleted=False, isActive=True)
    )
    can_view = serializers.BooleanField(default=True)
    can_create = serializers.BooleanField(default=False)
    can_update = serializers.BooleanField(default=False)
    can_delete = serializers.BooleanField(default=False)
    submenus = SubMenuPermissionAssignSerializer(many=True, required=False, default=[])


class RolePermissionAssignSerializer(serializers.Serializer):
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        source="role"
    )
    permissions = MenuPermissionAssignSerializer(many=True)


class QuotationRequestUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotationRequest
        fields = [
            "company_name",
            "contact_person",
            "email",
            "phone_number",
            "item_type",
            "material",
            "size_quantity",
            "delivery_date",
            "additional_note",

            "quotation_status",
            "workflow_status",

            # Admin-entered quotation figures (manual quoting, no auto-calculation)
            "valid_until",
            "sales_rep",
            "subtotal",
            "discount_percent",
            "total",

            "cancel_reason",
            "cancelled_by",

            "isActive",
        ]

    def validate(self, attrs):
        quotation_status = attrs.get(
            "quotation_status",
            self.instance.quotation_status
        )

        cancel_reason = attrs.get(
            "cancel_reason",
            self.instance.cancel_reason
        )

        if quotation_status == "cancelled" and not cancel_reason:
            raise serializers.ValidationError({
                "cancel_reason": "Cancel reason is required when quotation is cancelled."
            })

        return attrs
    
    