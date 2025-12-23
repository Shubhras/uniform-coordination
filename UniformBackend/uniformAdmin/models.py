from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission
from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator


# Create your models here.

# Role Table
class Role(models.Model):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("sales_rep", "Sales Rep"),
        ("corporate", "Corporate"),
        ("customer", "Customer"),
    ]
    role_name = models.CharField(max_length=60, choices=ROLE_CHOICES)
    slug = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.slug = slugify(self.role_name) if self.role_name else None
        super().save(*args, **kwargs)

    def __str__(self):
        return self.role_name
    

# Custom Admin User Manager
class AdminUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError("Email required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra):
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)

        if extra.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        # --- Add Role Logic Here ---
        admin_role, created = Role.objects.get_or_create(
            role_name="admin",
            defaults={
                # "role_name": "admin",
                "slug": "admin",
                "description": "Admin role with full access"
            }
        )

        extra.setdefault("role", admin_role)

        return self.create_user(email=email, password=password, **extra)


# Custom Admin User Model
class AdminUser(AbstractBaseUser, PermissionsMixin):
    name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(unique=True)
    mobile = models.CharField(max_length=15, unique=True, null=True, blank=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    language = models.CharField(max_length=10, default="en")

    # Fix conflicts by setting related names
    groups = models.ManyToManyField(Group, related_name="adminuser_groups", blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name="adminuser_permissions", blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = AdminUserManager()

    USERNAME_FIELD = 'email'
    
    def __str__(self):
        return self.email

class Fabric(models.Model):
    MATERIAL_CHOICES = [
        ("cotton", "Cotton"),
        ("polyester", "Polyester"),
        ("silk", "Silk"),
        ("linen", "Linen"),
    ]

    fabricName = models.CharField(max_length=150, unique=True)
    color = models.CharField(max_length=100)
    materialType = models.CharField(max_length=60, choices=MATERIAL_CHOICES)
    pricePerUnit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.fabricName



class Parts(models.Model):
    CATEGORY_CHOICES = [
        ("body", "Body"),
        ("sleeves", "Sleeves"),
        ("caps", "Caps"),
        ("straps", "Straps"),
        ("collars", "Collars"),
        ("cuffs", "Cuffs"),
        ("pockets", "Pockets"),
        ("hoods", "Hoods"),

    ]
    partName = models.CharField(max_length=150, unique=True)
    partImage = models.ImageField(upload_to='part_images/', blank=True, null=True)
    category = models.CharField(max_length=60, choices=CATEGORY_CHOICES)
    fabric = models.ForeignKey(Fabric, on_delete=models.CASCADE)
    usageTemmpCount = models.IntegerField(default=0)
    zIndex = models.IntegerField(default=0)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.partName
    

class Colors(models.Model):
    colorName = models.CharField(max_length=250)
    colorCode = models.TextField(null=True, blank=True)
    compatibleFabric = models.ManyToManyField(Fabric, blank=True)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.colorName


class Template(models.Model):
    templateName = models.CharField(max_length=250)
    templateImage = models.ImageField(upload_to='template_images/', blank=True, null=True)
    part = models.ForeignKey(Parts, on_delete=models.SET_NULL, null=True, blank=True)
    partUsageCount = models.IntegerField(default=0)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.templateName



#Categories
class Category(models.Model):
    categoryName = models.CharField(max_length=250,unique=True)
    slug = models.CharField(max_length=255, blank=True, null=True)
    order = models.PositiveIntegerField(default=0,db_index=True) #new
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.categoryName) if self.categoryName else None
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.categoryName
    
    
    
class Blog(models.Model):
    title = models.CharField(max_length=250,unique=True)
    slug = models.CharField(max_length=255, blank=True, null=True)
    category = models.ForeignKey(Category,on_delete=models.CASCADE,related_name="blogs")
    image = models.ImageField(upload_to="blog_images/",null=True,blank=True)
    description = models.TextField()

    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.title:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
 
 
class FAQ(models.Model):
    title = models.CharField(max_length=255,unique=True)
    # description = models.TextField(blank=True, null=True)

    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
   
   
class FAQDescription(models.Model):
    faq = models.ForeignKey(FAQ,related_name="descriptions", on_delete=models.CASCADE)
    description = models.TextField()

    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.faq.title}"
   
   
class CatalogImage(models.Model):
    name = models.CharField(max_length=255, unique=True)
    image = models.ImageField(upload_to="catalog_images/")
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="catalog_images")
    description = models.CharField(max_length=250)

    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            # slug with underscore
            self.slug = slugify(self.name).replace("-", "_")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name   
    

class SubCategory(models.Model):
    name = models.CharField(max_length=255)
    subcategoryImage = models.ImageField(upload_to="subcategory/", blank=True, null=True)
    order = models.PositiveIntegerField(default=0, db_index=True,blank=True, null=True)   
    category = models.ForeignKey(Category,on_delete=models.SET_NULL,null=True,blank=True,related_name="subcategories")
    slug = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug and self.name:
            self.slug = slugify(self.name).replace("-", "_")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    productType = [ 
    ('uniform', 'Uniform'),
    ('table', 'Table'),
    ]
    productName = models.CharField(max_length=255)
    slug = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    productType = models.CharField(max_length=20,choices=productType,default='uniform' ,blank=True, null=True)
    category = models.ForeignKey(Category,on_delete=models.SET_NULL,null=True,related_name="product_category")
    subcategory = models.ForeignKey(SubCategory,on_delete=models.SET_NULL, null=True,related_name="product_subcategory")
    parts = models.ManyToManyField(Parts,related_name="products_parts",blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    total_quantity = models.PositiveIntegerField(default=0)
    available_quantity = models.PositiveIntegerField(default=0)
    ProductImage = models.ImageField(upload_to='product_images/', blank=True, null=True)
    discount = models.PositiveIntegerField(blank=True, null=True) 
    isActive = models.BooleanField(default=True)
    isPopular = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug and self.productName:
            self.slug = slugify(self.productName)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.productName

    


class Promocode(models.Model):

    PROMOCODE_TYPE_CHOICES = [
        ("fix_price", "Fix Price"),
        ("discount", "Discount"),
    ]

    promocodeName = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    promocodeImage = models.ImageField(upload_to="promocode/", null=True, blank=True)
    description = models.TextField(blank=True)
    promocodeType = models.CharField(max_length=20, choices=PROMOCODE_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.promocodeName).replace("-", "_")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.promocodeName
   
    
  
class PrivacyPolicy(models.Model):

    POLICY_TYPE_CHOICES = [
        ("terms_and_conditions", "Terms and Conditions"),
        ("privacy_and_policy", "Privacy and Policy"),
    ]

    TABLE_TYPE_CHOICES = [
        ("uniform", "Uniform"),
        ("table", "Table"),
    ]

    privacyPolicyType = models.CharField(
        max_length=50,
        choices=POLICY_TYPE_CHOICES
    )
    type = models.CharField(
        max_length=20,
        choices=TABLE_TYPE_CHOICES
    )
    title = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    content = models.TextField()  # HTML content
    language = models.CharField(max_length=10)
    version = models.CharField(max_length=20)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title).replace("-", "_")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
  
  
    
# class PDFTemplate(models.Model):
#     PAPER_SIZES = (
#         ('A4', 'A4'),
#         ('Letter', 'Letter'),
#     )

#     name = models.CharField(max_length=100)

#     template = models.ForeignKey(
#         Template,                 
#         on_delete=models.PROTECT, 
#         related_name='pdf_layouts'
#     )

#     paper_size = models.CharField(max_length=10, choices=PAPER_SIZES)

#     total_custom_fields = models.PositiveIntegerField(default=0)

#     preview_pdf = models.FileField(
#         upload_to='pdf_templates/previews/',
#         null=True,
#         blank=True
#     )

#     is_active = models.BooleanField(default=True)

#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.name} ({self.template.templateName})"
    