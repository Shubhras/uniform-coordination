from django.db import models
from django.forms import CharField
from uniformAdmin.models import Role, Product, TableTheme
from django.conf import settings
from django.contrib.auth.hashers import make_password
import uuid
from django.utils import timezone
from uniformAdmin.models import Product
import uuid
from django.utils.text import slugify
from decimal import Decimal


class Users(models.Model):
# class Users(AbstractBaseUser, PermissionsMixin):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    LOGIN_CHOICES = [
        ('app', 'App'),
        ('google', 'Google'),
        ('apple', 'Apple'),
    ]
    user_type_CHOICES = [
        ('uniform', 'Uniform'),
        ('table', 'Table'),
        # ('both', 'Both'),
    ]
    # email = models.EmailField(unique=True, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)  
    password = models.CharField(max_length=255)  
    userType = models.CharField(max_length=20,choices=user_type_CHOICES, default='table', blank=True, null=True)
    phone = models.CharField(max_length=20,blank=True, null=True)
    userName = models.CharField(max_length=255, null=True,blank=True)
    firstName = models.CharField(max_length=100, null=True,blank=True)
    lastName = models.CharField(max_length=100, null=True,blank=True)
    language = models.CharField(max_length=10, default="english")
    gender = models.CharField(max_length=20,choices=GENDER_CHOICES, blank=True, null=True)
    profileImage = models.ImageField(upload_to='profile_Image/', blank=True, null=True)
    role = models.ForeignKey("uniformAdmin.Role", on_delete=models.SET_NULL, null=True, blank=True)
    lastLogin = models.DateTimeField(null=True, blank=True)
    isActive = models.BooleanField(default=True)
    deactivation_reason = models.TextField(blank=True, null=True)
    appleID = models.CharField(max_length=255, null=True, blank=True)
    stripeOrderCustomerId= models.CharField(max_length=255, null=True, blank=True)
    isDeleted = models.BooleanField(default=False)
    loginType = models.CharField(max_length=20,choices=LOGIN_CHOICES, default='app')    
    email_notifications = models.BooleanField(default=True, null=True, blank=True)
    push_notifications = models.BooleanField(default=True, null=True, blank=True)
    is_verify = models.BooleanField(default=False)
    is_currently_login = models.BooleanField(default=False)

    
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
 
    def save(self, *args, **kwargs):
        if not self.role:
            self.role, _ = Role.objects.get_or_create(role_name="user")
        super().save(*args, **kwargs)

 
    def __str__(self):
        return self.email
    
    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    @property
    def is_authenticated(self):
        return True  



class Favourite(models.Model):
    # PRODUCT_TYPE_CHOICES = [
    #     ('uniform', 'Uniform'),
    #     ('table', 'Table'),
    # ]

    product = models.ForeignKey(Product,on_delete=models.CASCADE,related_name="favourites")
    user = models.ForeignKey(Users,on_delete=models.CASCADE,related_name="user_favourites")
    # product_type = models.CharField(max_length=20,choices=PRODUCT_TYPE_CHOICES)
    is_like = models.BooleanField(default=False)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('product', 'user')

    def __str__(self):
        return f"{self.user} - {self.product} - {self.is_like}"


class ThemeFavourite(models.Model):
    theme = models.ForeignKey(TableTheme, on_delete=models.CASCADE, related_name="theme_favourites")
    user = models.ForeignKey(Users, on_delete=models.CASCADE, related_name="user_theme_favourites")
    is_like = models.BooleanField(default=False)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('theme', 'user')

    def __str__(self):
        return f"{self.user} - {self.theme} - {self.is_like}"


# Cart
class Cart(models.Model):
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    is_delete = models.DateTimeField(auto_now_add=True)
    is_update = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True,null=True, blank=True)


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("uniformAdmin.Product", on_delete=models.CASCADE)
    custom_theme = models.ForeignKey("CustomUpdateThemes", on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)  
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    final_price = models.DecimalField(max_digits=10, decimal_places=2,default=0) 
    total_price = models.DecimalField(max_digits=10, decimal_places=2,default=0)
    
    created_at = models.DateTimeField(auto_now_add=True) 
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)  

    def save(self, *args, **kwargs):

            self.price = Decimal(self.product.price)
            self.discount = Decimal(self.product.discount or 0)

            if self.discount > 0:
                discount_amount = (self.price * self.discount) / Decimal("100")
                self.final_price = self.price - discount_amount
            else:
                self.final_price = self.price

            self.total_price = self.final_price * Decimal(self.quantity)

            super().save(*args, **kwargs)



class CustomerDetails(models.Model):
    user = models.OneToOneField(Users, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    userName = models.CharField(max_length=255, null=True,blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    country = models.CharField(max_length=100)
    payment_method = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    isActive = models.BooleanField(default=True,null= True,blank=True)
    isDeleted = models.BooleanField(default=False,null=True,blank=True)
    
    def __str__(self):
        return f"{self.id} - {self.user}"
    



class Order(models.Model):
    ORDER_TYPE_CHOICES = [
        ('uniform', 'Uniform'),
        ('table', 'Table'),
    ]
 
    STATUS_CHOICE = [
       ('pending','Pending'),
       ('confirmed', 'Confirmed'),
       ('cancelled','Cancelled'),
       ('processing', 'Processing'),
       ('out_for_delivery', 'Out For Delivery'),
       ('delivered', 'Delivered'),
       ('returned', 'Returned'),
       ('paid','Paid'),
    ]
    user =models.ForeignKey(Users,on_delete=models.SET_NULL,null=True,blank=True)
    order_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    shipping_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0,null=True,blank=True)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0,null=True,blank=True)
    cart = models.ForeignKey(Cart,on_delete=models.SET_NULL,null=True,blank=True)
    custom_theme = models.ForeignKey("CustomUpdateThemes", on_delete=models.SET_NULL, null=True, blank=True)
    customer =models.ForeignKey(CustomerDetails,on_delete=models.SET_NULL,null=True,blank=True)
    payment_method = models.CharField(max_length=500,null=True,blank=True)
    currency = models.CharField(max_length=10,null=True,blank=True)
    status = models.CharField(max_length=50,choices=STATUS_CHOICE,default='pending')
    order_type =models.CharField(max_length=50,choices=ORDER_TYPE_CHOICES,default='table')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    rental_start_date = models.DateField(null=True,blank=True)
    rental_end_date = models.DateField(null=True,blank=True)
    rental_days = models.PositiveIntegerField(default=1, null=True, blank=True)  
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True) 
    cancel_reason = models.CharField(max_length=50,null=True, blank=True)
    admin_cancel_reason = models.CharField(max_length=255, null=True, blank=True)
    cancelled_by = models.CharField(max_length=20, null=True, blank=True)
    promocode =models.ForeignKey("uniformAdmin.Promocode",on_delete=models.SET_NULL,null=True, blank=True)
    is_paid =models.BooleanField(default=False,null=True,blank=True)
    is_returned = models.BooleanField(default=False,null=True,blank=True)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    is_update = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)



    def save(self, *args, **kwargs):
        if not self.order_id:
            from django.utils import timezone
            year_str = timezone.now().strftime("%y")
            prefix = f"ORD{year_str}-"
            
            latest_order = Order.objects.filter(order_id__startswith=prefix).order_by("-order_id").first()
            if latest_order and latest_order.order_id:
                try:
                    parts = latest_order.order_id.split("-")
                    if len(parts) == 2:
                        last_num = int(parts[1])
                        next_num = last_num + 1
                    else:
                        next_num = 1
                except (ValueError, IndexError):
                    next_num = 1
            else:
                next_num = 1
            
            self.order_id = f"{prefix}{next_num:05d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_id}"

class OrderItem(models.Model):
    order =models.ForeignKey(Order,on_delete=models.CASCADE,related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    custom_theme = models.ForeignKey("CustomUpdateThemes", on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    rental_days = models.PositiveIntegerField(default=1)
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2,null = True, blank=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    

    def __str__(self):
        return f"{self.product.productName} x {self.quantity}"

class Rental(models.Model):
    STATUS_CHOICES = [
        ('rented','Rented'),
        ('returned', 'Returned'),
        ('late', 'Late'),
        ('lost','Lost'),
        ('partial_return', 'Partial Return'),
        ('damaged','Damaged')
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='rental',null=True, blank=True)
    rental_id =models.CharField(max_length=50,unique=True,null=True,blank=True)
    customer = models.ForeignKey(CustomerDetails, on_delete=models.CASCADE,blank=True)
    rental_date = models.DateField(auto_now_add=True)
    start_date = models.DateField()
    end_date = models.DateField()
    actual_return_date = models.DateField(null=True, blank=True)
    shipping_address = models.TextField()
    delivery_time = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='rented')
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    late_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    damage_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    lost_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    grace_period_days = models.IntegerField(default=3)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    is_reviewed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self,*args,**kwargs):
        if not self.rental_id:
            prefix ='REN'
            uid =uuid.uuid4().hex[:6].upper()
            self.rental_id =f"{prefix}-{uid}"
        super().save(*args,**kwargs)    

    def __str__(self):
        return f"Rental {self.id} - {self.customer.userName}"

class RentalItem(models.Model):
    rental = models.ForeignKey(Rental, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    returned_quantity = models.PositiveIntegerField(default=0)
    lost_quantity = models.PositiveIntegerField(default=0)
    is_returned = models.BooleanField(default=False)
    is_damaged = models.BooleanField(default=False)
    is_lost = models.BooleanField(default=False)
    rfid_tag = models.CharField(max_length=100, blank=True, null=True) 
    notes = models.TextField(blank=True, null=True)

    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def save(self, *args, **kwargs):
        days = (self.rental.end_date - self.rental.start_date).days
        days = max(days, 1)
        self.subtotal = self.quantity * self.price_per_day * days
        super().save(*args, **kwargs)

class Payment(models.Model):
    PAYMENT_STATUS = [
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('pending', 'Pending'),
        ('processing','Processing'),
    ]
   
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    custom_theme = models.ForeignKey("CustomUpdateThemes", on_delete=models.SET_NULL, null=True, blank=True)
    payment_id = models.CharField(max_length=255, unique=True)
    customer_id = models.CharField(max_length=255, blank=True, null=True)  
    payment_method_id = models.CharField(max_length=100, blank=True, null=True) 
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS)
    payment_method = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10)
    paid_at = models.DateTimeField(blank=True, null=True)
    client_secret = models.CharField(max_length=255, blank=True, null=True) 
    is_active = models.BooleanField(default=True,null=True, blank=True)
    is_delete = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    is_update = models.DateField(auto_now=True,null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True,null=True, blank=True)

class Refund(models.Model):
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='refunds')
    payment = models.ForeignKey('Payment', on_delete=models.SET_NULL, null=True, blank=True, related_name='refunds')
    user = models.ForeignKey('Users', on_delete=models.CASCADE, related_name='refunds')
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.CharField(max_length=255, blank=True, null=True)
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processed', 'Processed'),
        ('rejected', 'Rejected'),
        ('failed', 'Failed') ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_note = models.TextField(blank=True, null=True)
    payment_gateway_id = models.CharField(max_length=100, blank=True, null=True)
    REFUND_METHOD_CHOICES = [
        ('original', 'Original Payment'),
        ('wallet', 'Wallet'),
        ('manual', 'Manual'),
    ]
    refund_method = models.CharField(max_length=20, choices=REFUND_METHOD_CHOICES, default='original')
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(blank=True, null=True)
    currency = models.CharField(max_length=10, default='INR')

    def __str__(self):
        return f"Refund {self.id} - Order {self.order.order_id} - {self.status}"

    
#-----------------Notification --------------------


# NOTIFICATION_TYPE_CHOICES = [
#     ('uniform_order', 'Uniform Order Updates'),
#     ('table_order', 'Table Order Updates'),
#     ('system', 'System Updates'),
#     ('promotion', 'Promotions'),
#     ('security', 'Security Alerts'),
# ]

# class Notifications(models.Model):
#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name="notification_preferences"
#     )

#     type = models.CharField(
#         max_length=50,
#         choices=NOTIFICATION_TYPE_CHOICES,
#         null=True,
#         blank=True
#     )

#     is_enabled = models.BooleanField(default=True, null=True, blank=True)
#     isActive = models.BooleanField(default=True)
#     isDeleted = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.user} - {self.type}"



# class UserDevice(models.Model):
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
#     onesignal_player_id = models.CharField(max_length=255, unique=True)
#     device_type = models.CharField(max_length=20)
#     is_active = models.BooleanField(default=True)


class ModelInfo(models.Model):
    # product = models.OneToOneField(Product,on_delete=models.CASCADE,related_name="model_info",null=True,blank=True)
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="model_infos",
        null=True,
        blank=True
    )
    model_file = models.FileField(upload_to="3d_models/",null=True,blank=True)
    description = models.TextField(blank=True, null=True)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True,null=True,blank=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)

    class Meta:
        ordering = ['-created_at']

    # def __str__(self):
    #     return self.product.productName
    
    def __str__(self):
        return self.product.productName if self.product else f"ModelInfo #{self.pk}"
    


class CustomUpdateModels(models.Model):
    user = models.ForeignKey(Users, on_delete=models.CASCADE, null=True, blank=True)
    model_info = models.ForeignKey(ModelInfo, on_delete=models.CASCADE, null=True, blank=True)

    config_json = models.JSONField(default=dict, null=True, blank=True)
    design_specifications = models.JSONField(default=dict, null=True, blank=True)

    json_file_path = models.CharField(max_length=500,null=True,blank=True,help_text="Stored JSON file path")
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


    class Meta:
        unique_together = ('user', 'model_info')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} → {self.model_info}"

class QuotationRequest(models.Model):
    # Admin controlled status
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("sent", "Sent"),
        ("approved", "Approved"),
        ("cancelled", "Cancelled"),
    )

    WORKFLOW_STATUS = (
        ("REQUESTED", "Requested"),     # Initial request
        ("AGREED", "Terms Agreed"),     # User agreed
        ("SENT", "Sent to Client"),     # Admin sent
        ("SIGNED", "Client Signed"),    # User signed
        ("COMPLETED", "Completed"),     # Admin completed process
    )

    uuids = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quotation_id = models.CharField(max_length=20, unique=True, null=True)
    company_name = models.CharField(max_length=255, null=True, blank=True)
    contact_person = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    customupdatemodel = models.ForeignKey("CustomUpdateModels",on_delete=models.SET_NULL,related_name="quotation_requests",null=True, blank=True)
    item_type = models.CharField(max_length=100, null=True, blank=True)
    material = models.CharField(max_length=100, null=True, blank=True)
    size_quantity = models.TextField(help_text="Mention sizes with quantities (e.g. M-10, L-20)",null=True, blank=True)
    delivery_date = models.DateField()
    additional_note = models.TextField(blank=True, null=True)
    agreed_to_terms = models.BooleanField(default=False)
    agreed_terms_version = models.CharField(max_length=20, null=True, blank=True)
    agreed_at = models.DateTimeField(null=True, blank=True)
    agreed_ip = models.GenericIPAddressField(null=True, blank=True)
    agreed_user_agent = models.TextField(null=True, blank=True)
    workflow_status = models.CharField(max_length=20, choices=WORKFLOW_STATUS, default="REQUESTED")
    quotation_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    
    external_document_id = models.CharField(max_length=255, null=True, blank=True)
    signed_pdf = models.FileField(upload_to='signed_pdfs/', null=True, blank=True)
    signed_at = models.DateTimeField(null=True, blank=True)
    is_signed = models.BooleanField(default=False) 
    cancelled_by = models.CharField(max_length=10, null=True, blank=True)
    cancel_reason = models.TextField(null=True, blank=True)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company_name} - {self.item_type}"

    def save(self, *args, **kwargs):
        if not self.quotation_id:
            prefix = "QUOT"
            uid = uuid.uuid4().hex[:6].upper()
            self.quotation_id = f"{prefix}-{uid}"
        super().save(*args, **kwargs)


class Contract(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("sent", "Sent"),
        ("signed", "Signed"),
        ("cancelled", "Cancelled"),
    )

    WORKFLOW_STATUS = (
        ("REQUESTED", "Requested"),     # Initial request
        ("SENT", "Sent to Client"),     # Sent via CloudSign/DocuSign
        ("SIGNED", "Client Signed"),    # Client signed
        ("COMPLETED", "Completed"),     # Admin completed process
        ("DECLINED", "Declined"),       # Client declined
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contract_id = models.CharField(max_length=50, unique=True, null=True)
    order = models.ForeignKey("Order", on_delete=models.SET_NULL, related_name="contracts", null=True, blank=True)
    company_name = models.CharField(max_length=255, null=True, blank=True)
    contact_person = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    delivery_date = models.DateField(null=True, blank=True)
    additional_note = models.TextField(blank=True, null=True)
    workflow_status = models.CharField(max_length=20, choices=WORKFLOW_STATUS, default="REQUESTED")
    contract_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    
    external_document_id = models.CharField(max_length=255, null=True, blank=True)
    signed_pdf = models.FileField(upload_to='signed_contracts/', null=True, blank=True)
    signed_at = models.DateTimeField(null=True, blank=True)
    is_signed = models.BooleanField(default=False)
    
    cancelled_by = models.CharField(max_length=10, null=True, blank=True)
    cancel_reason = models.TextField(null=True, blank=True)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.contract_id:
            from django.utils import timezone
            year_str = timezone.now().strftime("%y")
            prefix = f"CTR{year_str}-"
            
            latest_contract = Contract.objects.filter(contract_id__startswith=prefix).order_by("-contract_id").first()
            if latest_contract and latest_contract.contract_id:
                try:
                    parts = latest_contract.contract_id.split("-")
                    if len(parts) == 2:
                        last_num = int(parts[1])
                        next_num = last_num + 1
                    else:
                        next_num = 1
                except (ValueError, IndexError):
                    next_num = 1
            else:
                next_num = 1
                
            self.contract_id = f"{prefix}{next_num:05d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.contract_id} - {self.company_name or self.contact_person}"


class ContractAuditLog(models.Model):
    contract = models.ForeignKey("Contract", on_delete=models.CASCADE, related_name="audit_logs")
    action = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.contract.contract_id} - {self.action} at {self.created_at}"


class CustomUpdateThemes(models.Model):
    user = models.ForeignKey(Users, on_delete=models.CASCADE, null=True, blank=True)
    theme = models.ForeignKey(TableTheme, on_delete=models.CASCADE, null=True, blank=True)

    config_json = models.JSONField(default=dict, null=True, blank=True)
    design_specifications = models.JSONField(default=dict, null=True, blank=True)

    json_file_path = models.CharField(max_length=500, null=True, blank=True, help_text="Stored JSON file path")
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'theme')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} → {self.theme}"





