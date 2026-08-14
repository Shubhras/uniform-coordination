from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from django.db import IntegrityError
from .models import *  # adjust import if needed
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
from datetime import timedelta
from datetime import date
# from userhub.models import Notifications
from uniformAdmin.serializers import ProductSerializer

from decimal import Decimal
from .utils import parse_size_quantity
# from unif .utils import build_media_url
from uniformAdmin.utils import new_build_media_url
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
                    "User with this email already exists."
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

class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = [
            'id',
            'user',
            'is_active',
            'created_at'
        ]

# from uniformAdmin.utils import new_build_media_url
# class CartItemSerializer(serializers.ModelSerializer):
#     cart = CartSerializer(read_only=True)
#     product_name = serializers.CharField(
#         source='product.productName',
#         read_only=True
#     )

#     product_image = serializers.ImageField(
#         source='product.ProductImage',
#         read_only=True
#     )

#     class Meta:
#         model = CartItem
#         fields = [
#             'id',
#             'cart',
#             'product_name',
#             'product_image',
#             'quantity',
#             'price',
#             'final_price',
#             'total_price'
#         ]
#         read_only_fields = ['price', 'final_price', 'total_price']
        
#     def get_product_image(self, obj):
#         if obj.product:
#             return new_build_media_url(obj.product.ProductImage)
#         return None

class CartItemSerializer(serializers.ModelSerializer):
    cart = CartSerializer(read_only=True)

    product_name = serializers.CharField(
        source="product.productName",
        read_only=True
    )

    product_image = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            "id",
            "cart",
            "product_name",
            "product_image",
            "quantity",
            "price",
            "final_price",
            "total_price",
        ]
        read_only_fields = [
            "price",
            "final_price",
            "total_price",
        ]

    def get_product_image(self, obj):
        if obj.product:
            return new_build_media_url(obj.product.ProductImage)
        return None
   
#class CartSerializer(serializers.ModelSerializer):
    

class ProductMiniSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    subcategory_name = serializers.CharField(source="subcategory.name", read_only=True)

    class Meta:
        model = Product
        fields = ["id","productName","slug","description","price",
            "discount","ProductImage","productType","type",
            "category_name","subcategory_name","available_quantity","isPopular",]
        read_only_fields = [
            'price',
            'final_price',
            'total_price'
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')

        if request and representation.get('product_image'):
            representation['product_image'] = request.build_absolute_uri(
                representation['product_image']
            )

        return representation
    
    


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = [
            "firstName",
            "lastName",
            "phone",
            "gender",
            "language",
            "userName",
            "userType",
            "profileImage",
        ]

    def validate_userName(self, value):
        user = self.instance
        if value and Users.objects.filter(userName=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("Username already exists.")
        return value    
    
# class ProductMiniSerializer(serializers.ModelSerializer):
#     category_name = serializers.CharField(source="category.name", read_only=True)
#     subcategory_name = serializers.CharField(source="subcategory.name", read_only=True)


#     class Meta:
#         model = Product
#         fields = [
#             "id","productName","slug","description","price",
#             "discount","ProductImage","productType","type",
#             "category_name","subcategory_name","available_quantity","isPopular",
#         ]



# class OrderSerializer(serializers.ModelSerializer):
#     items = CartItemSerializer(many=True, read_only=True)
#     estimated_delivery = serializers.SerializerMethodField()

#     class Meta:
#         model = Cart
#         fields = ['id', 'user', 'is_active', 'created_at', 'items',]

class CustomerDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerDetails
        fields = [
            'id',
            'user',
            'first_name',
            'last_name',
            'email',
            'phone',
            'address_line_1',
            'address_line_2',
            'city',
            'postal_code',
            'country',
            'payment_method',
            'isActive',
            'isDeleted',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    def validate_email(self, value):
        if not value.endswith('@example.com'):
            raise serializers.ValidationError("Email must belong to example.com domain")
        return value

    def validate_phone(self, value):
        if len(value) < 10:
            raise serializers.ValidationError("Phone number must be at least 10 digits")
        return value


class RentalItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()
    late_fee = serializers.SerializerMethodField()
    lost_fee = serializers.SerializerMethodField()
    damage_fee = serializers.SerializerMethodField()

    class Meta:
        model = RentalItem
        fields = [
            'id', 'product', 'quantity', 'price_per_day', 'subtotal',
            'returned_quantity', 'lost_quantity', 'is_returned', 'is_damaged', 'is_lost',
            'late_fee', 'lost_fee', 'damage_fee', 'notes'
        ]
        read_only_fields = ['subtotal']

class RentalSerializer(serializers.ModelSerializer):
    items = RentalItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Rental
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'
        
class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__' 
        read_only_fields = [
            "order_id",
            "subtotal",
            "discount_amount",
            "shipping_fee",
            "tax_amount",
            "total_amount",
            "status",
            "created_at",
        ] 
        

    def get_estimated_delivery(self, obj):
        if obj.status in ['pending', 'conformed', 'processing', 'out_for_delivery']:
            return obj.start_date + timedelta(days=7)
        elif obj.status == 'delivered':
            return obj.return_date
        return None

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
    model_file = serializers.SerializerMethodField()

    isActive = serializers.BooleanField(default=True)
    isDeleted = serializers.BooleanField(default=False)

    class Meta:
        model = ModelInfo
        fields = [
            "id",
            "product",
            "model_file",
            "description",
            "isActive",
            "isDeleted",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_model_file(self, obj):
        request = self.context.get("request")

        if not obj.model_file:
            return None

        if request:
            return request.build_absolute_uri(obj.model_file.url)

        return obj.model_file.url
    
# class ModelInfoSerializer(serializers.ModelSerializer):
#     isActive = serializers.BooleanField(default=True)
#     isDeleted = serializers.BooleanField(default=False)
#     class Meta:
#         model = ModelInfo
#         fields = [
#             'id',
#             'product',
#             'model_file',
#             'description',
#             'isActive',
#             'isDeleted',
#             'created_at',
#             'updated_at',
#         ]
#         read_only_fields = ['created_at', 'updated_at']
    
#     def get_model_file(self, obj):
#         request = self.context.get('request')
#         if obj.model_file and request:
#             return request.build_absolute_uri(obj.model_file.url)
#         return None
    
class RentalItemSerializer(serializers.ModelSerializer):
    # product = ProductSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()
    late_fee = serializers.SerializerMethodField()
    lost_fee = serializers.SerializerMethodField()
    damage_fee = serializers.SerializerMethodField()
 
    class Meta:
        model = RentalItem
        fields = [
            'id', 'product', 'quantity', 'price_per_day', 'subtotal',
            'returned_quantity', 'lost_quantity', 'is_returned', 'is_damaged', 'is_lost',
            'late_fee', 'lost_fee', 'damage_fee', 'notes'
        ]
        read_only_fields = ['subtotal'] 
class RentalSerializer(serializers.ModelSerializer):
    items = RentalItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Rental
        fields = '__all__'
        read_only_fields = ['total_amount', 'late_fee']
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

class QuotationRequestSerializer(serializers.ModelSerializer):
    customupdatemodel = CustomUpdateModelQuotationSerializer(read_only=True)  
    customupdatemodel_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUpdateModels.objects.filter(
            isActive=True,
            isDeleted=False
        ),
        source="customupdatemodel",
        write_only=True,
        required=False,
        allow_null=True
    )
    
    # Product Details
    product_id = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
    product_image = serializers.SerializerMethodField()
    product_type = serializers.SerializerMethodField()
    
    product_category_id = serializers.SerializerMethodField()
    product_category_name = serializers.SerializerMethodField()

    product_subcategory_id = serializers.SerializerMethodField()
    product_subcategory_name = serializers.SerializerMethodField()

    class Meta:
        model = QuotationRequest
        fields = [
            "uuids",
            "quotation_id",
            "quotation_status",
            "workflow_status",
            "company_name",
            "contact_person",
            "email",
            "phone_number",
            "customupdatemodel",
            "customupdatemodel_id",   # Request
            "item_type",
            "product_id",
            "product_name",
            "product_image",
            "product_type",

            "product_category_id",
            "product_category_name",

            "product_subcategory_id",
            "product_subcategory_name",
            "material",
            "size_quantity",
            "delivery_date",
            "additional_note",

            # Admin-entered quotation figures (manual quoting, no auto-calculation)
            "valid_until",
            "sales_rep",
            "subtotal",
            "discount_percent",
            "total",
            "last_sent_at",

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
    def create(self, validated_data):
        # Deliberately does NOT generate quotation_id.
        #
        # This used to set QUOT-{uuid hex}, which pre-empted the model's save() and
        # meant the automated QUOyy-00001 running code never applied. Leave the field
        # unset so QuotationRequest.save() -> DocumentCounter.next_code("QUO") is the
        # single source for document numbers.
        validated_data.pop("quotation_id", None)
        return super().create(validated_data)
    
    
    
    def get_product_category_id(self, obj):
        product = (
            obj.customupdatemodel.model_info.product
            if obj.customupdatemodel
            and obj.customupdatemodel.model_info
            and obj.customupdatemodel.model_info.product
            else None
        )

        return product.category.id if product and product.category else None


    def get_product_category_name(self, obj):
        product = (
            obj.customupdatemodel.model_info.product
            if obj.customupdatemodel
            and obj.customupdatemodel.model_info
            and obj.customupdatemodel.model_info.product
            else None
        )

        return product.category.categoryName if product and product.category else None


    def get_product_subcategory_id(self, obj):
        product = (
            obj.customupdatemodel.model_info.product
            if obj.customupdatemodel
            and obj.customupdatemodel.model_info
            and obj.customupdatemodel.model_info.product
            else None
        )

        return product.subcategory.id if product and product.subcategory else None


    def get_product_subcategory_name(self, obj):
        product = (
            obj.customupdatemodel.model_info.product
            if obj.customupdatemodel
            and obj.customupdatemodel.model_info
            and obj.customupdatemodel.model_info.product
            else None
        )

        return product.subcategory.name if product and product.subcategory else None
    
    
    
    def get_product_id(self, obj):
        if (
            obj.customupdatemodel
            and obj.customupdatemodel.model_info
            and obj.customupdatemodel.model_info.product
        ):
            return obj.customupdatemodel.model_info.product.id
        return None

    def get_product_name(self, obj):
        if (
            obj.customupdatemodel
            and obj.customupdatemodel.model_info
            and obj.customupdatemodel.model_info.product
        ):
            return obj.customupdatemodel.model_info.product.productName
        return None

    def get_product_image(self, obj):
        if (
            obj.customupdatemodel
            and obj.customupdatemodel.model_info
            and obj.customupdatemodel.model_info.product
        ):
            return new_build_media_url(
                obj.customupdatemodel.model_info.product.ProductImage
            )
        return None

    def get_product_type(self, obj):
        if (
            obj.customupdatemodel
            and obj.customupdatemodel.model_info
            and obj.customupdatemodel.model_info.product
        ):
            return obj.customupdatemodel.model_info.product.productType
        return None


# new 
class CustomUpdateModelsSerializer(serializers.ModelSerializer):
    json_file_url = serializers.SerializerMethodField()

    productName = serializers.SerializerMethodField()
    ProductImage = serializers.SerializerMethodField()

    class Meta:
        model = CustomUpdateModels
        fields = [
            "id",
            "user",
            "model_info",

            "productName",
            "ProductImage",

            # config_json holds the shopper's actual choices (colours, fabric, part,
            # options, size quantities). It was missing from this list, so every write
            # to it was silently dropped and every read came back empty — which is why
            # the Design Result screen had nothing to show and fell back to fixed text.
            "config_json",

            "design_specifications",
            "json_file_path",
            "json_file_url",

            "isActive",
            "isDeleted",
            "created_at",
        ]
        read_only_fields = ["user", "json_file_path"]

    def get_productName(self, obj):
        if obj.model_info and obj.model_info.product:
            return obj.model_info.product.productName
        return None

    def get_ProductImage(self, obj):
        if obj.model_info and obj.model_info.product:
            return new_build_media_url(obj.model_info.product.ProductImage)
        return None

    def get_json_file_url(self, obj):
        if not obj.json_file_path:
            return None

        return (
            f"{settings.SITE_URL}"
            f"{settings.MEDIA_URL}"
            f"{obj.json_file_path.lstrip('/')}"
        )    
    
    
class QuotationSummarySerializer(serializers.ModelSerializer):
    total_amount = serializers.SerializerMethodField()
    size_range = serializers.SerializerMethodField()
    notes_terms = serializers.SerializerMethodField()
    line_items = serializers.SerializerMethodField()
    status_label = serializers.CharField(source='get_quotation_status_display')

    class Meta:
        model = QuotationRequest
        fields = [
            'uuids', 'quotation_id', 'quotation_status', 'status_label',
            'created_at', 'total_amount', 'size_range', 'notes_terms', 'line_items',
        ]

    def _get_product(self, obj):
        if obj.customupdatemodel and obj.customupdatemodel.model_info:
            return obj.customupdatemodel.model_info.product
        return None

    def _get_config(self, obj):
        return (obj.customupdatemodel.config_json or {}) if obj.customupdatemodel else {}

    def get_line_items(self, obj):
        product = self._get_product(obj)
        sizes = parse_size_quantity(obj.size_quantity)
        total_qty = sum(s['qty'] for s in sizes) or 1
        unit_price = product.price if product else Decimal('0.00')

        items = [{
            "description": f"{product.productName if product else obj.item_type} - {obj.material or ''}".strip(' -'),
            "detail": f"Sizes: {obj.size_quantity}" if obj.size_quantity else "",
            "quantity": total_qty,
            "unit_price": str(unit_price),
            "total": str(unit_price * total_qty),
        }]

        config = self._get_config(obj)
        setup_fee = config.get('setup_fee')  # e.g. embroidery digitizing fee
        if setup_fee:
            items.append({
                "description": "Setup Fee - Embroidery",
                "detail": "One-time digitizing fee",
                "quantity": 1,
                "unit_price": str(setup_fee),
                "total": str(setup_fee),
            })
        return items

    def get_total_amount(self, obj):
        items = self.get_line_items(obj)
        return str(sum(Decimal(i['total']) for i in items))

    def get_size_range(self, obj):
        return parse_size_quantity(obj.size_quantity)

    def get_notes_terms(self, obj):
        config = self._get_config(obj)
        return config.get('terms', [
            "Price includes one-time embroidery setup fee.",
            "Standard shipping via FedEx Ground (3-5 business days).",
            "50% deposit required upon acceptance to begin production.",
            "Returns only accepted for manufacturing defects.",
        ])


class UserNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNotification
        fields = ["id", "title", "message", "is_seen", "created_at"]

        
            