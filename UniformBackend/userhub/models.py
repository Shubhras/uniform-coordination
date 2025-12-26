from django.db import models
from uniformAdmin.models import Role , Product
from django.conf import settings
from django.contrib.auth.hashers import make_password
import uuid
from uniformAdmin.models import Product
from django.utils.text import slugify


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
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE,related_name="items")
    product = models.ForeignKey("uniformAdmin.Product", on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    delete_at = models.DateTimeField(null=True, blank=True)

    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    # total_price
    def save(self, *args, **kwargs):
        self.price = self.product.price 
        self.total_price = self.quantity * self.price
        super().save(*args, **kwargs)


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
    

    def __str__(self):
        return f"{self.id} - {self.user}"
    


class Order(models.Model):
    ORDER_TYPE_CHOICES = [
        ('uniform', 'UNOFORM'),
        ('table', 'TABLE'),
        
    ]
    STATUS_CHOICE = [
        ('pending','PENDING'),
        ('paid','PAID'),
        ('failed','FAILED'),
    ]
    user =models.ForeignKey(Users,on_delete=models.CASCADE)
    order_id  =models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    cart = models.ForeignKey(Cart,on_delete=models.CASCADE)
    customer =models.ForeignKey(CustomerDetails,on_delete=models.CASCADE)
    Payment_method =models.CharField(max_length=50)
    status = models.CharField(max_length=50,choices=STATUS_CHOICE)
    order_type =models.CharField(max_length=50,choices=ORDER_TYPE_CHOICES)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    start_date =models.DateField(auto_now_add=True)
    return_date =models.DateField(auto_now_add=True)
    promocode =models.ForeignKey("uniformAdmin.Promocode",on_delete=models.CASCADE,null=True, blank=True)



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
