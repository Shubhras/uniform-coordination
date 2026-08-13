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

class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    email = serializers.EmailField(required=True)
    userName = serializers.CharField(required=False, max_length=255)
    userType = serializers.CharField(required=False, default="table")

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
        userType = attrs.get("userType", "table")
        if not userType:
            userType = "table"
        attrs["userType"] = userType

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
    userType = serializers.CharField(required=False, default="table")


    def validate(self, data):
        email = data.get("email")
        password = data.get("password")
        userType = data.get("userType", "table")
        if not userType:
            userType = "table"
        data["userType"] = userType

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



from uniformAdmin.utils import new_build_media_url

class CartItemSerializer(serializers.ModelSerializer):
    cart = CartSerializer(read_only=True)

    product_name = serializers.CharField(
        source="product.productName",
        read_only=True
    )
    product_description = serializers.CharField(
        source="product.description",
        read_only=True
    )

    product_image = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            "id",
            "cart",
            "product_name",
            "product_description",
            "product_image",
            "quantity",
            "price",
            "final_price",
            "total_price",
            "custom_theme",
        ]
        read_only_fields = [
            "price",
            "final_price",
            "total_price",
            "custom_theme",
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
    item_name = serializers.SerializerMethodField()
    item_image = serializers.SerializerMethodField()
    delivery_address = serializers.SerializerMethodField()

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

    def get_item_name(self, obj):
        if obj.custom_theme and obj.custom_theme.theme:
            return obj.custom_theme.theme.title
        item = obj.items.select_related("product").first()
        if item and item.product:
            return item.product.productName
        return None

    def get_item_image(self, obj):
        request = self.context.get("request")
        if obj.custom_theme and obj.custom_theme.theme and obj.custom_theme.theme.image:
            if request:
                return request.build_absolute_uri(obj.custom_theme.theme.image.url)
            return obj.custom_theme.theme.image.url
        item = obj.items.select_related("product").first()

        if (
            item
            and item.product
            and item.product.ProductImage
        ):
            if request:
                return request.build_absolute_uri(item.product.ProductImage.url)
            return item.product.ProductImage.url

        return None
    
    def get_delivery_address(self, obj):
        customer = obj.customer

        if not customer:
            return None

        return {
            "name": f"{customer.first_name} {customer.last_name}",
            "phone": customer.phone,
            "email": customer.email,
            "address_line_1": customer.address_line_1,
            "address_line_2": customer.address_line_2,
            "city": customer.city,
            "postal_code": customer.postal_code,
            "country": customer.country,
        }




class userOrderSerializer(serializers.ModelSerializer):
    item_name = serializers.SerializerMethodField()
    item_image = serializers.SerializerMethodField()
    delivery_address = serializers.SerializerMethodField()
    order_items = serializers.SerializerMethodField()
    payment_summary = serializers.SerializerMethodField()
    contract_info = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = "__all__"

    def get_item_name(self, obj):
        if obj.custom_theme and obj.custom_theme.theme:
            return obj.custom_theme.theme.title
        item = obj.items.select_related("product").first()
        return item.product.productName if item and item.product else None

    def get_item_image(self, obj):
        request = self.context.get("request")
        if obj.custom_theme and obj.custom_theme.theme and obj.custom_theme.theme.image:
            if request:
                return request.build_absolute_uri(obj.custom_theme.theme.image.url)
            return obj.custom_theme.theme.image.url
        item = obj.items.select_related("product").first()

        if item and item.product and item.product.ProductImage:
            if request:
                return request.build_absolute_uri(item.product.ProductImage.url)
            return item.product.ProductImage.url
        return None

    def get_contract_info(self, obj):
        contract = obj.contracts.order_by("-created_at").first()
        if not contract:
            return None
        request = self.context.get("request")
        signed_pdf_url = None
        if contract.signed_pdf:
            if request:
                signed_pdf_url = request.build_absolute_uri(contract.signed_pdf.url)
            else:
                signed_pdf_url = contract.signed_pdf.url
        return {
            "contract_id": contract.contract_id,
            "contract_status": contract.contract_status,
            "workflow_status": contract.workflow_status,
            "created_at": contract.created_at.isoformat() if contract.created_at else None,
            "signed_at": contract.signed_at.isoformat() if contract.signed_at else None,
            "signed_pdf": signed_pdf_url,
        }

    def get_delivery_address(self, obj):
        customer = obj.customer
        if not customer:
            return None

        return {
            "name": f"{customer.first_name} {customer.last_name}",
            "phone": customer.phone,
            "email": customer.email,
            "address_line_1": customer.address_line_1,
            "address_line_2": customer.address_line_2,
            "city": customer.city,
            "postal_code": customer.postal_code,
            "country": customer.country,
        }
        

    def get_payment_summary(self, obj):
        payment = obj.payment_set.order_by("-created_at").first()

        promo_code = None
        promo_type = None
        promo_amount = Decimal("0.00")

        if obj.promocode:
            promo_code = obj.promocode.promocodeName
            promo_type = obj.promocode.promocodeType

            if obj.promocode.promocodeType == "discount":
                promo_amount = (
                    Decimal(obj.subtotal or 0) * Decimal(obj.promocode.amount)
                ) / Decimal("100")
            elif obj.promocode.promocodeType == "fix_price":
                promo_amount = Decimal(obj.promocode.amount or 0)

        return {
            "subtotal": str(obj.subtotal or Decimal("0.00")),
            "promo_code": promo_code,
            "promo_type": promo_type,
            "promo_amount": str(promo_amount),
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
        
    # def get_payment_summary(self, obj):
    #     payment = obj.payment_set.order_by("-created_at").first()

    #     return {
    #         "subtotal": str(obj.subtotal or Decimal("0.00")),
    #         "shipping_charge": str(obj.shipping_charge or Decimal("0.00")),
    #         "tax": str(obj.tax or Decimal("0.00")),
    #         "total_amount": str(obj.total_amount or Decimal("0.00")),

    #         "payment_status": payment.payment_status if payment else None,
    #         "payment_method": payment.payment_method if payment else None,
    #         "currency": payment.currency if payment else obj.currency,
    #         "payment_id": payment.payment_id if payment else None,
    #         "customer_id": payment.customer_id if payment else None,
    #         "payment_method_id": payment.payment_method_id if payment else None,
    #         "amount_paid": str(payment.amount) if payment else None,
    #         "paid_at": payment.paid_at if payment else None,
    #     }
            

    def get_order_items(self, obj):
        request = self.context.get("request")

        items = []

        for item in obj.items.select_related("product"):
            product = item.product

            items.append({
                "id": item.id,
                "product_id": product.id,
                "product_name": product.productName,
                "product_image": (
                    request.build_absolute_uri(product.ProductImage.url)
                    if request and product.ProductImage
                    else None
                ),
                "quantity": item.quantity,
                "rental_days": item.rental_days,
                "price_per_day": str(item.price_per_day),
                "subtotal": str(item.subtotal),
                "product_type": product.productType,
                "category": product.category.categoryName if product.category else None,
               
                "color": product.color.colorName if product.color else None,
                "fabric": product.fabric.fabricName if product.fabric else None,
                "size": product.size,
            })

        return items
    
    
class PaymentSerializer(serializers.ModelSerializer):
    cartitem =CartItemSerializer(read_only=True)
    order = userOrderSerializer(read_only=True)

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




class ProductOrderListSerializer(serializers.ModelSerializer):
    order_id = serializers.CharField(source="order.order_id", read_only=True)
    customer_name = serializers.SerializerMethodField()
    order_status = serializers.CharField(source="order.status", read_only=True)
    payment_method = serializers.CharField(source="order.payment_method", read_only=True)
    total_amount = serializers.DecimalField(
        source="order.total_amount",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    rental_start_date = serializers.DateField(source="order.rental_start_date", read_only=True)
    rental_end_date = serializers.DateField(source="order.rental_end_date", read_only=True)
    order_created_at = serializers.DateTimeField(source="order.created_at", read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "order_id",
            "customer_name",
            "order_status",
            "payment_method",
            "quantity",
            "price_per_day",
            "subtotal",
            "total_amount",
            "rental_start_date",
            "rental_end_date",
            "order_created_at",
        ]

    def get_customer_name(self, obj):
        if obj.order.customer:
            return getattr(obj.order.customer, "userName", None)
        return None


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
    class Meta:
        model = QuotationRequest
        fields = [
            "uuids",
            "quotation_id",
            "company_name",
            "contact_person",
            "email",
            "phone_number",
            "customupdatemodel",
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
    def create(self, validated_data):
        if not validated_data.get("quotation_id"):
            validated_data["quotation_id"] = f"QUOT-{uuid.uuid4().hex[:6].upper()}"
        return super().create(validated_data)


# new 
class CustomUpdateModelsSerializer(serializers.ModelSerializer):
    json_file_url = serializers.SerializerMethodField()

    productName = serializers.SerializerMethodField()
    ProductImage = serializers.SerializerMethodField()

    # New fields
    category = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    productType = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    table_shape = serializers.SerializerMethodField()
    product_id = serializers.SerializerMethodField()

    class Meta:
        model = CustomUpdateModels
        fields = [
            "id",
            "user",
            "model_info",

            "productName",
            "product_id",
            "ProductImage",
            "category",
            "description",
            "productType","type","table_shape",

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
    
    def get_product_id(self, obj):
        if obj.model_info and obj.model_info.product:
            return obj.model_info.product.id
        return None

    def get_ProductImage(self, obj):
        if obj.model_info and obj.model_info.product:
            return new_build_media_url(obj.model_info.product.ProductImage)
        return None

    def get_category(self, obj):
        product = getattr(obj.model_info, "product", None)
        if product and product.category:
            return {
                "id": product.category.id,
                "name": product.category.categoryName,
            }
        return None

    def get_description(self, obj):
        product = getattr(obj.model_info, "product", None)
        return product.description if product else None

    def get_productType(self, obj):
        product = getattr(obj.model_info, "product", None)
        return product.productType if product else None
    
    def get_type(self, obj):
        product = getattr(obj.model_info, "product", None)
        return product.type if product else None
    
    def get_table_shape(self, obj):
        if obj.design_specifications and "table_shape" in obj.design_specifications:
            return obj.design_specifications["table_shape"]
        product = getattr(obj.model_info, "product", None)
        return product.table_shape if product else None
    
    

    def get_json_file_url(self, obj):
        if not obj.json_file_path:
            return None

        return (
            f"{settings.SITE_URL}"
            f"{settings.MEDIA_URL}"
            f"{obj.json_file_path.lstrip('/')}"
        )


class CustomUpdateThemesSerializer(serializers.ModelSerializer):
    json_file_url = serializers.SerializerMethodField()
    themeName = serializers.SerializerMethodField()
    ThemeImage = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    theme_id = serializers.SerializerMethodField()
    products = serializers.SerializerMethodField()

    class Meta:
        model = CustomUpdateThemes
        fields = [
            "id",
            "user",
            "theme",
            "themeName",
            "theme_id",
            "ThemeImage",
            "category",
            "description",
            "config_json",
            "design_specifications",
            "json_file_path",
            "json_file_url",
            "isActive",
            "isDeleted",
            "created_at",
            "products",
        ]
        read_only_fields = ["user", "json_file_path"]

    def get_products(self, obj):
        if not obj.theme:
            return []
        items = obj.theme.theme_items.select_related('product').all()
        result = []
        for item in items:
            prod = item.product
            result.append({
                "id": prod.id,
                "title": prod.productName,
                "description": prod.description,
                "price": float(prod.price) if prod.price else 0.0,
                "image": new_build_media_url(prod.ProductImage) if prod.ProductImage else None,
                "section": item.section,
                "section_display": item.get_section_display(),
            })
        return result

    def get_themeName(self, obj):
        if obj.theme:
            return obj.theme.title
        return None

    def get_theme_id(self, obj):
        if obj.theme:
            return obj.theme.id
        return None

    def get_ThemeImage(self, obj):
        if obj.theme and obj.theme.image:
            return new_build_media_url(obj.theme.image)
        return None

    def get_category(self, obj):
        if obj.theme and obj.theme.category:
            return {
                "id": obj.theme.category.id,
                "name": obj.theme.category.categoryName,
            }
        return None

    def get_description(self, obj):
        if obj.theme:
            return obj.theme.description
        return None

    def get_json_file_url(self, obj):
        if not obj.json_file_path:
            return None
        return (
            f"{settings.SITE_URL}"
            f"{settings.MEDIA_URL}"
            f"{obj.json_file_path.lstrip('/')}"
        )

        
# class CustomUpdateModelsSerializer(serializers.ModelSerializer):
#     json_file_url = serializers.SerializerMethodField()

#     productName = serializers.SerializerMethodField()
#     ProductImage = serializers.SerializerMethodField()

#     class Meta:
#         model = CustomUpdateModels
#         fields = [
#             "id",
#             "user",
#             "model_info",

#             "productName",
#             "ProductImage",

#             "design_specifications",
#             "json_file_path",
#             "json_file_url",

#             "isActive",
#             "isDeleted",
#             "created_at",
#         ]
#         read_only_fields = ["user", "json_file_path"]

#     def get_productName(self, obj):
#         if obj.model_info and obj.model_info.product:
#             return obj.model_info.product.productName
#         return None

#     def get_ProductImage(self, obj):
#         if obj.model_info and obj.model_info.product:
#             return new_build_media_url(obj.model_info.product.ProductImage)
#         return None

#     def get_json_file_url(self, obj):
#         if not obj.json_file_path:
#             return None

#         return (
#             f"{settings.SITE_URL}"
#             f"{settings.MEDIA_URL}"
#             f"{obj.json_file_path.lstrip('/')}"
#         )    
    
    

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