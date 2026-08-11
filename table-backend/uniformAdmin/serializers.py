from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from django.conf import settings
import re
from django.utils import timezone
from .models import *
from datetime import timedelta
from .utils import get_default_b2b_role, new_build_media_url
from userhub.models import *
# User = get_user_model()
import json
# from userhub.models import Order


def build_media_url(file_field, request=None):
    """
    Returns absolute media URL for a FileField/ImageField
    """
    if not file_field:
        return None

    url_name = getattr(file_field, "name", str(file_field))
    if url_name.startswith(("http://", "https://")):
        return url_name

    if request:
        return request.build_absolute_uri(file_field.url)

    domain = settings.SITE_DOMAIN
    if settings.DEBUG and ("sslip.io" in domain or "localhost" in domain):
        domain = "http://127.0.0.1:8002"

    file_url = file_field.url if hasattr(file_field, "url") else f"{settings.MEDIA_URL}{url_name}"
    if file_url.startswith("/"):
        return f"{domain.rstrip('/')}{file_url}"
    return f"{domain.rstrip('/')}/{file_url}"


from django.conf import settings

# def build_media_url(request, file_field):
#     if not file_field:
#         return None

#     # Already an absolute URL (e.g. S3, Unsplash, CDN)
#     url = getattr(file_field, "url", str(file_field))

#     if url.startswith(("http://", "https://")):
#         return url

#     # Prefer request if available
#     if request:
#         return request.build_absolute_uri(url)

#     # Fallback to SITE_URL
#     return f"{settings.SITE_URL}{url}"

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
    
    def create(self, validated_data):
        if "isActive" not in self.initial_data:
            validated_data["isActive"] = True
        return super().create(validated_data)





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
    partName = serializers.CharField(source='part.partName',read_only=True)
    partCategory = serializers.CharField(source='part.category',read_only=True)
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
        return build_media_url(obj.image, self.context.get("request"))

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


from django.conf import settings
from rest_framework import serializers

class SubCategorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source="category.categoryName",
        read_only=True
    )
    subcategoryImage = serializers.SerializerMethodField()

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

    def get_subcategoryImage(self, obj):
        if not obj.subcategoryImage:
            return None

        # External URL (e.g. Unsplash)
        if obj.subcategoryImage.name.startswith(("http://", "https://")):
            return obj.subcategoryImage.name

        return f"{settings.SITE_URL}{obj.subcategoryImage.url}"

    def validate(self, attrs):
        name = attrs.get("name")
        category = attrs.get("category")

        if name and category:
            exists = SubCategory.objects.filter(
                name__iexact=name,
                category=category,
                isDeleted=False
            ).exclude(
                pk=self.instance.pk if self.instance else None
            ).exists()

            if exists:
                raise serializers.ValidationError({
                    "name": "Validation Failed; subcategory with this name already exists in this category."
                })

        return attrs



class ThemeCoverImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThemeCoverImage
        fields = ['id', 'image', 'created_at']

class ThemeItemSerializer(serializers.ModelSerializer):
    product_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ThemeItem
        fields = ['id', 'theme', 'product', 'section', 'product_details', 'created_at']
        
    def get_product_details(self, obj):
        # We can return a subset of product fields for the builder UI
        return {
            "id": obj.product.id,
            "productName": obj.product.productName,
            "ProductImage": request.build_absolute_uri(obj.product.ProductImage.url) if (request:=self.context.get('request')) and obj.product.ProductImage else (obj.product.ProductImage.url if obj.product.ProductImage else None),
            # "ProductImage": build_media_url(obj.product.ProductImage.url) if (request:=self.context.get('request')) and obj.product.ProductImage else (obj.product.ProductImage.url if obj.product.ProductImage else None),
            # "ProductImage": new_build_media_url(obj.product.ProductImage),
            "price": str(obj.product.price),
        }

class TableThemeSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)
    category_name = serializers.CharField(
        source='category.categoryName',
        read_only=True
    )
    cover_images = ThemeCoverImageSerializer(many=True, read_only=True)
    theme_items = serializers.SerializerMethodField(read_only=True)
    is_favourite = serializers.SerializerMethodField(read_only=True)

    def get_is_favourite(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            from userhub.models import Users
            if isinstance(request.user, Users):
                from userhub.models import ThemeFavourite
                return ThemeFavourite.objects.filter(
                    theme=obj,
                    user=request.user,
                    is_like=True,
                    isDeleted=False
                ).exists()
        return False

    class Meta:
        model = TableTheme
        fields = [
            'id',
            'title',
            'category',
            'category_name',
            'description',
            'image',
            'cover_images',
            'theme_items',
            'order',
            'is_active',
            'isDeleted',
            'created_at',
            'updated_at',
            'is_favourite'
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
        elif instance.image:
            data['image'] = instance.image.url
        else:
            data['image'] = None
        return data
    
    # def to_representation(self, instance):
    #     data = super().to_representation(instance)
    #     request = self.context.get("request")
    #     data["image"] = build_media_url(request, instance.image)
    #     return data
        
    def get_theme_items(self, obj):
        # Group theme items by section
        items = obj.theme_items.all()
        grouped = {
            "table_setup": [],
            "floral_decor": [],
            "seating": [],
            "additional_elements": []
        }
        serializer = ThemeItemSerializer(items, many=True, context=self.context)
        for item in serializer.data:
            section = item['section']
            if section in grouped:
                grouped[section].append(item)
            else:
                grouped[section] = [item]
        return grouped
    
    def validate_title(self,value):
        qs = TableTheme.objects.filter(title__iexact=value,isDeleted=False)
        if self.instance:
             qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError(
                "Catalog Image with this Name already exists."
            )

        return value
    

class CategoryMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "categoryName", "type", "slug"]


class SubCategoryMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ["id", "name", "slug"]


class PartsMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parts
        fields = ["id", "partName", "category"]

class ProductSerializer(serializers.ModelSerializer):
    isActive = serializers.BooleanField(required=False, default=True)
    show = serializers.BooleanField(source='show_in_simulation', required=False, default=True)
 
    category = CategoryMiniSerializer(read_only=True)
    subcategory = SubCategoryMiniSerializer(read_only=True)
    parts = PartsMiniSerializer(read_only=True, many=True)
    ProductImage = serializers.SerializerMethodField()  # for response
    ProductImage_file = serializers.ImageField(write_only=True, required=False) 
    
    # New Computed Fields for Inventory Quantities
    on_rent_quantity = serializers.SerializerMethodField()
    cleaning_quantity = serializers.SerializerMethodField()
    inspect_quantity = serializers.SerializerMethodField()
    damaged_quantity = serializers.SerializerMethodField()
 
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
    
    # theme = serializers.PrimaryKeyRelatedField(
    #     queryset=TableTheme.objects.filter(is_active=True, isDeleted=False),
    #     required=False,
    #     allow_null=True
    # )
    fabric_details = serializers.SerializerMethodField(read_only=True)
    color_details = serializers.SerializerMethodField(read_only=True)
    is_favourite = serializers.SerializerMethodField(read_only=True)

    def get_is_favourite(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            from userhub.models import Users
            if isinstance(request.user, Users):
                from userhub.models import Favourite
                return Favourite.objects.filter(
                    product=obj,
                    user=request.user,
                    is_like=True,
                    isDeleted=False
                ).exists()
        return False
 
    class Meta:
        model = Product
        fields = [
            "id", "productName", "slug", "description", "productType",
            # "theme",
            
            # New specific attributes
            "table_shape", "style", "fabric", "color", "size", "rfid_tracking_enabled",
            "show",
            "fabric_details",
            "color_details",
            "is_favourite",

            # READ
            "category", "subcategory", "parts", "ProductImage",

            # WRITE
            "category_id", "subcategory_id", "parts_ids", "ProductImage_file",

            "price","rental_price_per_day", "discount", "total_quantity", "available_quantity",
            "isActive", "created_at",
            
            # Computed Quantities
            "on_rent_quantity", "cleaning_quantity", "inspect_quantity", "damaged_quantity"
        ]

    def to_internal_value(self, data):
        data = data.copy()
 
        parts = data.get("parts_ids")
        if parts and isinstance(parts, str):
            try:
                data.setlist("parts_ids", json.loads(parts))
            except (json.JSONDecodeError, TypeError):
                raise serializers.ValidationError({
                    "parts_ids": "Invalid format. Use [1,2,3]."
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
    
    def get_ProductImage(self, obj):
        return new_build_media_url(obj.ProductImage)
    # def get_ProductImage(self, obj):
    #     return new_build_media_url(obj.ProductImage)
    
    def get_on_rent_quantity(self, obj):
        # We need to fetch from userhub RentalItem where rental is active
        # To avoid complex cross-app imports in the serializer, we use the reverse relation if possible
        # or we dynamically import it.
        try:
            from userhub.models import RentalItem
            return sum(item.quantity for item in obj.rentalitem_set.filter(rental__status='rented'))
        except Exception:
            return 0
            
    def get_cleaning_quantity(self, obj):
        return sum(item.quantity for item in obj.cleaning_records.filter(status='cleaning'))
        
    def get_inspect_quantity(self, obj):
        # Inspections are linked to RentalItem or Order. 
        # But we need to know the product.
        # Actually, InspectionItem links to RentalItem which links to Product.
        try:
            from uniformAdmin.models import InspectionItem
            return sum(insp.returned_qty for insp in InspectionItem.objects.filter(
                rental_item__product=obj, result='pending'))
        except Exception:
            return 0
            
    def get_fabric_details(self, obj):
        if not obj.fabric:
            return None

        return {
            "id": obj.fabric.id,
            "name": obj.fabric.fabricName
        }


    def get_color_details(self, obj):
        if not obj.color:
            return None

        return {
            "id": obj.color.id,
            "name": obj.color.colorName
        }
    def get_damaged_quantity(self, obj):
        return sum(item.quantity for item in obj.damaged_records.filter(status__in=['pending', 'repair']))
    
    

    # def get_ProductImage(self, obj):
    #     if obj.ProductImage:
    #         return build_media_url(obj.ProductImage, self.context.get("request"))
    #     return None

    def create(self, validated_data):
        image = validated_data.pop('ProductImage_file', None)
        product = super().create(validated_data)
        if image:
            product.ProductImage = image
            product.save()
        return product    
 
  
    def to_internal_value(self, data):
        data = data.copy()
 
        parts = data.get("parts_ids")
        if parts and isinstance(parts, str):
            try:
                data.setlist("parts_ids", json.loads(parts))
            except (json.JSONDecodeError, TypeError):
                raise serializers.ValidationError({
                    "parts_ids": "Invalid format. Use [1,2,3]."
                })
 
        return super().to_internal_value(data)
 
    def update(self, instance, validated_data):
        image = validated_data.pop("ProductImage_file", None)

        instance = super().update(instance, validated_data)

        if image:
            instance.ProductImage = image
            instance.save(update_fields=["ProductImage"])

        return instance

    def validate(self, data):
        product_type = data.get(
            "productType",
            self.instance.productType if self.instance else None
        )

        # theme_value = data.get(
        #     "theme",
        #     self.instance.theme if self.instance else None
        # )

        category = data.get(
            "category",
            self.instance.category if self.instance else None
        )

        subcategory = data.get(
            "subcategory",
            self.instance.subcategory if self.instance else None
        )

        if subcategory and category and subcategory.category != category:
            raise serializers.ValidationError({
                "subcategory": "Selected subcategory does not belong to selected category"
            })

        total_qty = data.get(
            "total_quantity",
            self.instance.total_quantity if self.instance else 0
        )

        avail_qty = data.get(
            "available_quantity",
            self.instance.available_quantity if self.instance else 0
        )

        if avail_qty > total_qty:
            raise serializers.ValidationError({
                "available_quantity": "Available quantity cannot exceed total quantity"
            })
            

        # if product_type == "table" and not theme_value:
        #     raise serializers.ValidationError({
        #         "theme": "Theme is required when product type is table."
        #     })

        # if product_type == "uniform" and "theme" in self.initial_data:
        #     raise serializers.ValidationError({
        #         "theme": "Theme is not allowed for uniform products."
        #     })

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
    
    
    
    
class SystemSettingsSerializer(serializers.ModelSerializer):
    logo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = SystemSettings
        fields = [
            "company_name",
            "business_address",
            "support_email",
            "contact_number",
            "default_language",
            "default_currency",
            "time_zone",
            "date_format",
            "logo",
            
            "email_host",
            "email_port",
            "email_username",
            "email_password",
            "email_use_tls",
            "email_from_address",
            "email_from_name",

            "email_notify_registration",
            "email_notify_order_placed",
            "email_notify_payment_success",
            "email_notify_payment_failure",
            "email_notify_shipping",
            "email_notify_return_received",
            "email_notify_return_overdue",
            "email_notify_late_fee",

            "payment_enable_kakebarai",
            "payment_enable_credit_card",
            "payment_enable_paypay",
            "payment_enable_conbini",
            "payment_enable_bank_transfer",
            "payment_enable_applepay",
            "payment_enable_googlepay",

            "stripe_publishable_key",
            "stripe_secret_key",
            "stripe_webhook_secret",

            "bank_name",
            "bank_branch",
            "bank_account_number",
            "bank_account_holder",

            "updated_at",
        ]
        read_only_fields = ["updated_at"]

    def to_representation(self, instance):
        data = super().to_representation(instance)

        request = self.context.get("request")
        if instance.logo:
            if request:
                data["logo"] = request.build_absolute_uri(instance.logo.url)
            else:
                data["logo"] = instance.logo.url
        else:
            data["logo"] = None

        return data


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
    recipient_name = serializers.SerializerMethodField()
    recipient_email = serializers.SerializerMethodField()
    order_id = serializers.SerializerMethodField()
    notification_status = serializers.SerializerMethodField()

    class Meta:
        model = AdminNotification
        fields = "__all__"

    def get_recipient_name(self, obj):
        if obj.content_object:
            return getattr(obj.content_object, "contact_person", None) or getattr(obj.content_object, "company_name", None) or "-"
        return "-"

    def get_recipient_email(self, obj):
        if obj.content_object:
            return getattr(obj.content_object, "email", None) or "-"
        return "-"

    def get_order_id(self, obj):
        if obj.content_object:
            order = getattr(obj.content_object, "order", None)
            if order:
                return getattr(order, "order_id", "-")
            return getattr(obj.content_object, "contract_id", None) or getattr(obj.content_object, "quotation_id", None) or "-"
        return "-"

    def get_notification_status(self, obj):
        if obj.content_object:
            status_val = getattr(obj.content_object, "workflow_status", None) or getattr(obj.content_object, "contract_status", None) or getattr(obj.content_object, "quotation_status", None) or "sent"
            status_lower = str(status_val).lower()
            if status_lower in ["sent", "success", "delivered", "done", "completed", "signed", "requested", "agreed"]:
                return "sent"
            return "failed"
        return "sent"
        
        
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
                "role": obj.user.role.role_name if obj.user.role else None,  # change name if your field differs
                "address": {
                    "address_line_1": customer.address_line_1,
                    "address_line_2": customer.address_line_2,
                    "city": customer.city,
                    "postal_code": customer.postal_code,
                    "country": customer.country,
                    "phone": customer.phone,
                }
            }

        except CustomerDetails.DoesNotExist:
            return None

    def get_payment(self, obj):
        payment = Payment.objects.filter(order=obj).first()
        if payment:
            return {
                                
                "subtotal": str(obj.subtotal or Decimal("0.00")),
                "shipping_charge": str(obj.shipping_charge or Decimal("0.00")),
                "tax": str(obj.tax or Decimal("0.00")),
                "total_amount": str(obj.total_amount or Decimal("0.00")),

                "payment_status": payment.payment_status if payment else None,
                "payment_method": payment.payment_method if payment else None,
                "currency": payment.currency if payment else obj.currency,
                "payment_id": payment.payment_id if payment else None,
                "customer_id": payment.customer_id if payment else None,
                "payment_method_id": payment.payment_method_id if payment else None,
                "amount_paid": str(payment.amount) if payment else None,
                "paid_at": payment.paid_at if payment else None,
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
#             }
#         return None


class DamagePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DamagePhoto
        fields = ['id', 'photo', 'created_at']

class InspectionItemSerializer(serializers.ModelSerializer):
    photos = DamagePhotoSerializer(many=True, read_only=True)
    item_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    order_id = serializers.SerializerMethodField()
    return_date = serializers.SerializerMethodField()
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = InspectionItem
        fields = '__all__'

    def get_item_name(self, obj):
        try:
            return obj.rental_item.product.productName
        except AttributeError:
            return None

    def get_category_name(self, obj):
        try:
            return obj.rental_item.product.category.categoryName
        except AttributeError:
            return None

    def get_order_id(self, obj):
        if obj.order:
            return obj.order.order_id
        try:
            return obj.rental_item.rental.order.order_id
        except AttributeError:
            return None

    def get_return_date(self, obj):
        if obj.order and obj.order.rental_end_date:
            return obj.order.rental_end_date
        try:
            return obj.rental_item.rental.end_date
        except AttributeError:
            return None

    def get_product_image(self, obj):
        try:
            request = self.context.get("request")
            return build_media_url(obj.rental_item.product.ProductImage, request)
        except AttributeError:
            return None

class DamagedItemSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    added = serializers.SerializerMethodField()

    class Meta:
        model = DamagedItem
        fields = '__all__'

    def get_name(self, obj):
        return obj.product.productName

    def get_category(self, obj):
        try:
            return obj.product.category.categoryName
        except AttributeError:
            return None

    def get_image(self, obj):
        try:
            request = self.context.get("request")
            return build_media_url(obj.product.ProductImage, request)
        except AttributeError:
            return None

    def get_added(self, obj):
        if obj.reported_at:
            return obj.reported_at.strftime("%d %b %Y")
        return None

class CleaningItemSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    added = serializers.SerializerMethodField()

    class Meta:
        model = CleaningItem
        fields = '__all__'

    def get_name(self, obj):
        return obj.product.productName

    def get_category(self, obj):
        try:
            return obj.product.category.categoryName
        except AttributeError:
            return None

    def get_image(self, obj):
        try:
            request = self.context.get("request")
            return build_media_url(obj.product.ProductImage, request)
        except AttributeError:
            return None

    def get_added(self, obj):
        if obj.entered_at:
            return obj.entered_at.strftime("%d %b %Y")
        return None

from uniformAdmin.models import PricingPackage, PricingRule

class PricingPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingPackage
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class PricingRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingRule
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
        
        

class RentalPolicySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentalPolicySettings
        fields = [
            'rental_pricing_formula_label',
            'late_fee_formula_label',
            'late_fee_rate',
            'grace_period_days',
            'flat_shipping_fee',
            'enable_consumption_tax',
            'tax_percentage',
            'updated_at',
        ]
        read_only_fields = ['rental_pricing_formula_label', 'updated_at']        
        
        

class RentalItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.productName",
        read_only=True
    )
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = RentalItem
        fields = [
            "id",
            "product",
            "product_name",
            "product_image",
            "quantity",
            "price_per_day",
            "subtotal",
            "returned_quantity",
            "lost_quantity",
            "is_returned",
            "is_damaged",
            "is_lost",
            "rfid_tag",
            "notes",
        ]

    def get_product_image(self, obj):
        return new_build_media_url(obj.product.ProductImage)
            
            
class RentalListSerializer(serializers.ModelSerializer):
    order_id = serializers.CharField(
        source="order.order_id",
        read_only=True
    )

    order_status = serializers.CharField(
        source="order.status",
        read_only=True
    )

    customer_name = serializers.SerializerMethodField()

    items = RentalItemSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Rental
        fields = [
            "id",
            "rental_id",
            "order_id",
            "customer_name",

            "status",
            "order_status",

            "start_date",
            "end_date",
            "actual_return_date",

            "shipping_fee",
            "tax",
            "discount_amount",
            "late_fee",
            "damage_fee",
            "lost_fee",
            "total_amount",

            "shipping_address",
            "delivery_time",

            "created_at",

            "items",
        ]

    def get_customer_name(self, obj):
        if obj.customer:
            return f"{obj.customer.first_name} {obj.customer.last_name}"
        return None
    
                