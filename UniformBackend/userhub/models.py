from django.db import models
from django.forms import CharField
from uniformAdmin.models import Role , Product
from django.conf import settings
from django.contrib.auth.hashers import make_password
import uuid
from django.utils import timezone
from uniformAdmin.models import Product
import uuid
from django.utils.text import slugify

# from uniformAdmin.models import QuotationTemplate
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
    userType = models.CharField(max_length=20,choices=user_type_CHOICES, blank=True, null=True)
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
    appleID = models.CharField(max_length=255, null=True, blank=True)
    stripeOrderCustomerId= models.CharField(max_length=255, null=True, blank=True)
    isDeleted = models.BooleanField(default=False)
    loginType = models.CharField(max_length=20,choices=LOGIN_CHOICES, default='app')    
    email_notifications = models.BooleanField(default=True, null=True, blank=True)
    push_notifications = models.BooleanField(default=True, null=True, blank=True)
    is_verify = models.BooleanField(default=False)

    
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
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)  
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    
    created_at = models.DateTimeField(default=timezone.now) 
    updated_at = models.DateTimeField(default=timezone.now)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    is_active = models.BooleanField(default=True)  

    def save(self, *args, **kwargs):
        # Always update price and total_price
        self.price = self.product.price
        self.total_price = self.quantity * self.price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.productName} (x{self.quantity})"



class CustomerDetails(models.Model):
    user = models.OneToOneField(Users, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
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
    Rental =models.CharField(max_length=50)
    isActive = models.BooleanField(default=True,null= True,blank=True)
    isDeleted = models.BooleanField(default=False,null=True,blank=True)
    

    def __str__(self):
        return f"{self.id} - {self.user}"
    


# class Order(models.Model):
#     ORDER_TYPE_CHOICES = [
#         ('uniform', 'UNOFORM'),
#         ('table', 'TABLE'),
        
#     ]
#     # STATUS_CHOICE = [
#     #     ('pending','PENDING'),
#     #     ('paid','PAID'),
#     #     ('failed','FAILED'),
#     # ]
#     STATUS_CHOICE=[
#         ('pending','Pending'),
#         ('conformed', 'Conformed'),
#         ('cancelled','Cancelled'),
#         ('processing', 'Processing'),
#         ('out_for_delivery', 'Out For Delivery'),
#         ('delivered', 'Delivered'),
#     ]
#     user =models.ForeignKey(Users,on_delete=models.CASCADE,null=True)
#     order_id  =models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
#     cart = models.ForeignKey(Cart,on_delete=models.CASCADE,null=True,blank=True)
#     customer =models.ForeignKey(CustomerDetails,on_delete=models.CASCADE,null=True)
#     Payment_method =models.CharField(max_length=50,null=True,blank=True)
#     status = models.CharField(max_length=50,choices=STATUS_CHOICE)
#     order_type =models.CharField(max_length=50,choices=ORDER_TYPE_CHOICES)
#     total_amount = models.DecimalField(max_digits=10, decimal_places=2)
#     rfid_tag_id = models.CharField(max_length=100,null=True,blank=True)
#     start_date =models.DateField(auto_now_add=True)
#     return_date =models.DateField(auto_now_add=True)
#     admin_cancel_reason = models.CharField(max_length=255, null=True, blank=True)
#     cancelled_by = models.CharField(max_length=20, null=True, blank=True)
#     promocode =models.ForeignKey("uniformAdmin.Promocode",on_delete=models.CASCADE,null=True, blank=True)
#     is_active = models.BooleanField(default=True,null=True,blank=True)
#     is_delete = models.DateTimeField(auto_now_add=True)       
#     is_update = models.DateField(auto_now_add=True)    
#     #created_at = models.DateTimeField(auto_now_add=True,null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

class Order(models.Model):
    ORDER_TYPE_CHOICES = [
    ('uniform', 'Uniform'),
    ('table', 'Table'),
]
 
    STATUS_CHOICE = [
       ('pending','Pending'),
       ('conformed', 'Conformed'),
       ('cancelled','Cancelled'),
       ('processing', 'Processing'),
       ('out_for_delivery', 'Out For Delivery'),
       ('delivered', 'Delivered'),
       ('paid','PAID'),
    ]
    user =models.ForeignKey(Users,on_delete=models.SET_NULL,null=True,blank=True)
    # order_id = models.CharField(max_length=100, unique=True)
    order_id = models.CharField(max_length=100, unique=True, blank=True, null=True)


    cart = models.ForeignKey(Cart,on_delete=models.SET_NULL,null=True,blank=True)
    customer =models.ForeignKey(CustomerDetails,on_delete=models.SET_NULL,null=True,blank=True)
    payment_method = models.CharField(max_length=50,null=True,blank=True)
    currency = models.CharField(max_length=10,null=True,blank=True)
    status = models.CharField(max_length=50,choices=STATUS_CHOICE,default='pending')
    order_type =models.CharField(max_length=50,choices=ORDER_TYPE_CHOICES)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    start_date =models.DateField(auto_now_add=True)
    return_date =models.DateField(auto_now_add=True)
    cancel_reason = models.CharField(max_length=50,null=True, blank=True)
    admin_cancel_reason = models.CharField(max_length=255, null=True, blank=True)
    cancelled_by = models.CharField(max_length=20, null=True, blank=True)
    promocode =models.ForeignKey("uniformAdmin.Promocode",on_delete=models.SET_NULL,null=True, blank=True)
    is_active = models.BooleanField(default=True,null=True,blank=True)
    is_delete = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    created_at = models.DateTimeField(auto_now_add=True,null=True, blank=True)
 
 
    def save(self, *args, **kwargs):
        if not self.order_id:
            prefix = "ORD"
            uid = uuid.uuid4().hex[:6].upper()
            self.order_id = f"{prefix}-{uid}"
        super().save(*args, **kwargs)
 
    def __str__(self):
        return f"Order {self.order_id}"
   
 

class Payment(models.Model):
    PAYMENT_STATUS = [
        ('SUCCESS','Success'), 
        ('FAILED','Failed'), 
        ('PENDING','Pending')]
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    payment_id = models.CharField(max_length=50, unique=True)
    customer_id = models.CharField(max_length=100, blank=True, null=True)  
    payment_method_id = models.CharField(max_length=100, blank=True, null=True) 
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS)
    payment_method = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    paid_at = models.DateTimeField(blank=True, null=True)
    client_secret = models.CharField(max_length=255, blank=True, null=True) 
    is_active = models.BooleanField(default=True,null=True, blank=True)
    is_delete = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    is_update = models.DateField(auto_now_add=True,null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True,null=True, blank=True)



    
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
    product = models.OneToOneField(Product,on_delete=models.CASCADE,related_name="model_info",null=True,blank=True)
    model_file = models.FileField(upload_to="3d_models/",null=True,blank=True)
    description = models.TextField(blank=True, null=True)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True,null=True,blank=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.product.productName


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

# class QuotationRequest(models.Model):
#     # Company & Contact
#     STATUS_CHOICES = (
#         ("pending", "Pending"),
#         ("sent", "Sent"),
#         ("approved", "Approved"),
#         ("cancelled", "Cancelled"),
#     )
#     WORKFLOW_STATUS = (
#         ("REQUESTED", "Requested"),
#         ("AGREED", "Terms Agreed"),
#         ("SENT", "Sent to Client"),
#         ("SIGNED", "Client Signed"),
#         ("COMPLETED", "Completed"),
#     )
    
#     uuids = models.UUIDField( primary_key=True,default=uuid.uuid4,editable=False)
#     quotation_id = models.CharField(max_length=20, unique=True,null=True)

#     company_name = models.CharField(max_length=255,null=True,blank=True)
#     contact_person = models.CharField(max_length=255,null=True,blank=True)
#     email = models.EmailField()
#     phone_number = models.CharField(max_length=20,null=True,blank=True)
#     customupdatemodel = models.ForeignKey(CustomUpdateModels,on_delete=models.SET_NULL,related_name="quotation_requests",null=True,blank=True)  # Uniform Request Details
#     item_type = models.CharField(max_length=100,null=True,blank=True)
#     material = models.CharField(max_length=100,null=True,blank=True)
#     size_quantity = models.TextField(help_text="Mention sizes with quantities (e.g. M-10, L-20)", null = True, blank = True)
#     delivery_date = models.DateField()
#     additional_note = models.TextField(blank=True, null=True)
#     agreed_to_terms = models.BooleanField(default=False)
#     workflow_status = models.CharField(max_length=20,choices=WORKFLOW_STATUS,default="REQUESTED")
#     agreed_terms_version = models.CharField(max_length=20, null=True, blank=True)
#     agreed_at = models.DateTimeField(null=True, blank=True)
#     agreed_ip = models.GenericIPAddressField(null=True, blank=True)
#     agreed_user_agent = models.TextField(null=True, blank=True)

#     quotation_status = models.CharField(max_length=20,choices=STATUS_CHOICES, default="pending")
#     cancelled_by = models.CharField(max_length=10,null=True, blank=True)
#     cancel_reason = models.TextField(null=True, blank=True)
#     isActive = models.BooleanField(default=True)
#     isDeleted = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.company_name} - {self.item_type}"
    

#     def save(self, *args, **kwargs):
#         if not self.quotation_id:
#             # You can customize this pattern as needed
#             prefix = 'QUOT'
#             uid = uuid.uuid4().hex[:6].upper()
#             self.quotation_id = f"{prefix}-{uid}"
#         super().save(*args, **kwargs)
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

# userhub/models.py

# class TermsAndConditions(models.Model):
#     title = models.CharField(max_length=255)
#     text = models.TextField()
#     version = models.CharField(max_length=20)   # v1.0, v2.0 etc
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.title} ({self.version})

#<------------Order_Item RT----------->
class OrderItem(models.Model):
    order = models.ForeignKey(Order,on_delete=models.CASCADE,related_name="order_items")
    product_name = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField()
    is_napkin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_rfid_tracked(self):
        return not self.is_napkin and self.rfid_tag_id is not None

    def __str__(self):
        return f"{self.product_name} ({self.quantity}) - Order {self.order.order_id}"

