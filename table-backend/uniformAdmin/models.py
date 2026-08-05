from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission
from django.db import models
from django.utils.text import slugify
from django.db.models import Q
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType



# Role Table
class Role(models.Model):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("sales_rep", "Sales Rep"),
        ("corporate", "Corporate"),
        ("customer", "Customer"),
        ("b2b","B2B"),   # remove 
        ("b2c","B2C"),
        
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
    TIER_CHOICES = [
        ("gold", "Gold"),
        ("silver", "Silver"),
        ("bronze", "Bronze"),
    ]
    name = models.CharField(max_length=255, blank=True, null=True)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    tier = models.CharField(max_length=60, choices=TIER_CHOICES,default="silver",blank=True, null=True)
    email = models.EmailField(unique=True)
    mobile = models.CharField(max_length=15, unique=True, null=True, blank=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    language = models.CharField(max_length=10, default="en")
    is_currently_login = models.BooleanField(default=False)


    # Fix conflicts by setting related names
    groups = models.ManyToManyField(Group, related_name="adminuser_groups", blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name="adminuser_permissions", blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = AdminUserManager()

    USERNAME_FIELD = 'email'
    
    def __str__(self):
        return self.email




class SystemSettings(models.Model):
    """
    Global system settings, such as company profile and regional preferences.
    Singleton — only one row should ever exist.
    """
    company_name = models.CharField(max_length=255, default="KIREIZ SPACE Co., Ltd.")
    business_address = models.TextField(blank=True, null=True)
    support_email = models.EmailField(blank=True, null=True)
    contact_number = models.CharField(max_length=50, blank=True, null=True)
    
    default_language = models.CharField(max_length=50, default="Japanese")
    default_currency = models.CharField(max_length=50, default="JPY (¥)")
    time_zone = models.CharField(max_length=100, default="(GMT+09:00) Tokyo")
    date_format = models.CharField(max_length=50, default="YYYY/MM/DD")
    
    logo = models.ImageField(upload_to="system/logos/", null=True, blank=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "System Settings"
        verbose_name_plural = "System Settings"

    def save(self, *args, **kwargs):
        # enforce singleton: always overwrite pk=1
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass  # prevent deletion of the singleton row

    @classmethod
    def load(cls):
        """Fetch the single settings row, creating it with defaults if missing."""
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return self.company_name or "System Settings"



class Fabric(models.Model):
    MATERIAL_CHOICES = [
        ("cotton", "Cotton"),
        ("polyester", "Polyester"),
        ("silk", "Silk"),
        ("linen", "Linen"),
    ]
    
    FABRIC_TYPE_CHOICES = [
        ('uniform', 'Uniform'),
        ('table', 'Table'),
    ]

    fabricName = models.CharField(max_length=150, unique=True)
    color = models.CharField(max_length=100)
    materialType = models.CharField(max_length=60, choices=MATERIAL_CHOICES)
    fabricType = models.CharField(max_length=20,choices=FABRIC_TYPE_CHOICES,default='uniform')
    theme = models.ForeignKey('TableTheme',on_delete=models.SET_NULL,null=True,blank=True,related_name="fabrics")
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
    
    PART_TYPE_CHOICES = [
        ('uniform', 'Uniform'),
        ('table', 'Table'),
    ]
    
    partName = models.CharField(max_length=150, unique=True)
    partImage = models.ImageField(upload_to='part_images/', blank=True, null=True)
    category = models.CharField(max_length=60, choices=CATEGORY_CHOICES)
    partType = models.CharField(max_length=20,choices=PART_TYPE_CHOICES,default='uniform')
    fabric = models.ForeignKey(Fabric, on_delete=models.CASCADE)
    usageTemmpCount = models.IntegerField(default=0)
    theme = models.ForeignKey('TableTheme',on_delete=models.SET_NULL,null=True,blank=True,related_name="parts")
    zIndex = models.IntegerField(default=0)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.partName
    

class Colors(models.Model):
    MATERIAL_CHOICES = ["cotton", "polyester", "silk", "linen"]
    
    colorName = models.CharField(max_length=250)
    colorCode = models.TextField(null=True, blank=True)
    # compatibleFabric = models.ManyToManyField(Fabric, blank=True)
    compatibleFabric = models.JSONField(default=list)  
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
    CATEGORY_TYPE = [
    ('uniform', 'Uniform'),
    ('table', 'Table'),
    ]
    categoryName = models.CharField(max_length=250)
    categoryImage = models.ImageField(upload_to="category/", blank=True, null=True)
    description = models.CharField(max_length=250,blank=True, null=True) 
    type = models.CharField(max_length=20,choices=CATEGORY_TYPE,default='table')    
    slug = models.CharField(max_length=255, blank=True, null=True)
    order = models.PositiveIntegerField(default=0,db_index=True) #new
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["categoryName"],
                condition=Q(isDeleted=False),
                name="unique_category_name_when_not_deleted"
            )
        ]
    

    
    def save(self, *args, **kwargs):
        if self.categoryName:
            new_slug = slugify(self.categoryName).replace("-", "_")

            # regenerate slug only if name changed
            if self.slug != new_slug:
                self.slug = new_slug

        super().save(*args, **kwargs)
    
    
class Blog(models.Model):
    BLOG_TYPE_CHOICES = (
        ('uniform', 'Uniform'),
        ('table', 'Table'),
    )
    title = models.CharField(max_length=250)
    slug = models.CharField(max_length=255, blank=True, null=True)
    category = models.ForeignKey(Category,on_delete=models.CASCADE,related_name="blogs")
    image = models.ImageField(upload_to="blog_images/",null=True,blank=True)
    description = models.TextField()
    type = models.CharField(max_length=20,choices=BLOG_TYPE_CHOICES,default='table')
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["title"],
                condition=Q(isDeleted=False),
                name="unique_blog_title_when_not_deleted"
            )
        ]


 
    def save(self, *args, **kwargs):
        if self.title:
            new_slug = slugify(self.title).replace("-", "_")

            # regenerate slug only if name changed
            if self.slug != new_slug:
                self.slug = new_slug

        super().save(*args, **kwargs)


class Menu(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.CharField(max_length=150, unique=True, blank=True, null=True)
    icon = models.CharField(max_length=100, blank=True, null=True)
    route = models.CharField(max_length=255, blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.pk:
            old = Menu.objects.get(pk=self.pk)
            if old.name != self.name:
                self.slug = slugify(self.name).replace("-", "_")
        else:
            self.slug = slugify(self.name).replace("-", "_")

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class SubMenu(models.Model):
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name="submenus")
    name = models.CharField(max_length=100)
    slug = models.CharField(max_length=150, blank=True, null=True)
    route = models.CharField(max_length=255, blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["menu", "name"],
                condition=models.Q(isDeleted=False),
                name="unique_submenu_name_per_menu"
            )
        ]

    def save(self, *args, **kwargs):
        if self.pk:
            old = SubMenu.objects.get(pk=self.pk)
            if old.name != self.name:
                self.slug = slugify(self.name).replace("-", "_")
        else:
            self.slug = slugify(self.name).replace("-", "_")

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.menu.name} -> {self.name}"


class RoleMenuPermission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="menu_permissions")
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name="role_permissions")
    can_view = models.BooleanField(default=True)
    can_create = models.BooleanField(default=False)
    can_update = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["role", "menu"],
                name="unique_role_menu_permission"
            )
        ]


class RoleSubMenuPermission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="submenu_permissions")
    submenu = models.ForeignKey(SubMenu, on_delete=models.CASCADE, related_name="role_permissions")
    can_view = models.BooleanField(default=True)
    can_create = models.BooleanField(default=False)
    can_update = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["role", "submenu"],
                name="unique_role_submenu_permission"
            )
        ]

 
 
 
class FAQ(models.Model):
    FAQ_TYPE_CHOICES = (
        ('uniform', 'Uniform'),
        ('table', 'Table'),
    )
    title = models.CharField(max_length=255,unique=True)
    # description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=20,choices=FAQ_TYPE_CHOICES,default='table')
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
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to="catalog_images/")
    slug = models.SlugField(max_length=255,blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="catalog_images")
    description = models.CharField(max_length=250)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
        
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["name"],
                condition=Q(isDeleted=False),
                name="unique_catalog_image_name_when_not_deleted"
            )
        ]
    


    
    def save(self, *args, **kwargs):
        if self.name:
            new_slug = slugify(self.name).replace("-", "_")

            # regenerate slug only if name changed
            if self.slug != new_slug:
                self.slug = new_slug

        super().save(*args, **kwargs)



class SubCategory(models.Model):
    SUBCATEGORY_TYPE = [
    ('uniform', 'Uniform'),
    ('table', 'Table'),
    ]
    name = models.CharField(max_length=255)
    subcategoryImage = models.ImageField(upload_to="subcategory/", blank=True, null=True)
    category = models.ForeignKey(Category,on_delete=models.SET_NULL,null=True,blank=True,related_name="subcategories")
    slug = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=20,choices=SUBCATEGORY_TYPE,default='table')
    order = models.PositiveIntegerField(default=0,db_index=True)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def save(self, *args, **kwargs):
        if self.name:
            new_slug = slugify(self.name).replace("-", "_")

            # regenerate slug only if name changed
            if self.slug != new_slug:
                self.slug = new_slug

        super().save(*args, **kwargs)

    
    
class TableTheme(models.Model):
    title = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField()
    image = models.ImageField(upload_to="table_themes/")
    order = models.PositiveIntegerField(default=0, db_index=True,blank=True, null=True) 
    is_active = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class ThemeCoverImage(models.Model):
    theme = models.ForeignKey(TableTheme, related_name="cover_images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="table_themes/covers/")
    created_at = models.DateTimeField(auto_now_add=True)

class ThemeItem(models.Model):
    SECTION_CHOICES = [
        ('table_setup', 'Table Setup'),
        ('floral_decor', 'Floral Decor'),
        ('seating', 'Seating'),
        ('additional_elements', 'Additional Elements'),
    ]
    theme = models.ForeignKey(TableTheme, related_name="theme_items", on_delete=models.CASCADE)
    product = models.ForeignKey('Product', related_name="theme_associations", on_delete=models.CASCADE)
    section = models.CharField(max_length=50, choices=SECTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('theme', 'product', 'section')

class Product(models.Model):
    productType = [ 
    ('uniform', 'Uniform'),
    ('table', 'Table'),
    ]
    type_CHOICES = [
        ("tablecloth", "Tablecloth"),
        ("napkin", "Napkin"),
        ("runner", "Runner"),
        ("chair_cover", "Chair Cover"),
        ("background", "Background"),
        # ("top", "Top"),
        # ("bottom", "Bottom"),
        # ("set", "Set"),
    ]
    TABLE_SHAPE_CHOICES = [
        ("round", "Round"),
        ("rectangle", "Rectangle"),
        ("square", "Square"),
        ("oval", "Oval"),
    ]
    STYLE_CHOICES = [
        ("premium", "Premium"),
        ("standard", "Standard"),
        ("luxury", "Luxury"),
        ("classic", "Classic"),
    ]
    productName = models.CharField(max_length=255)
    slug = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    productType = models.CharField(max_length=20,choices=productType,default='table' ,blank=True, null=True)
    type = models.CharField(max_length=30, choices=type_CHOICES, default="set")
    theme = models.ForeignKey(TableTheme,on_delete=models.SET_NULL,null=True,blank=True,related_name="products")
    category = models.ForeignKey(Category,on_delete=models.SET_NULL,null=True,related_name="product_category")
    subcategory = models.ForeignKey(SubCategory,on_delete=models.SET_NULL, null=True,related_name="product_subcategory")
    parts = models.ManyToManyField(Parts,related_name="products_parts",blank=True)
    table_shape = models.CharField(max_length=50, choices=TABLE_SHAPE_CHOICES, blank=True, null=True)
    style = models.CharField(max_length=50, choices=STYLE_CHOICES, blank=True, null=True)
    fabric = models.ForeignKey(Fabric, on_delete=models.SET_NULL, null=True, blank=True, related_name="fabric_products")
    color = models.ForeignKey(Colors, on_delete=models.SET_NULL, null=True, blank=True, related_name="color_products")
    size = models.CharField(max_length=100, blank=True, null=True)
    rfid_tracking_enabled = models.BooleanField(default=False)

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
    
    rental_price_per_day = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )


    def save(self, *args, **kwargs):
        if self.productName:
            new_slug = slugify(self.productName).replace("-", "_")

            # regenerate slug only if name changed
            if self.slug != new_slug:
                self.slug = new_slug

        super().save(*args, **kwargs)



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
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    limit_uses = models.BooleanField(default=False)
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
 

    def save(self, *args, **kwargs):
        if self.promocodeName:
            new_slug = slugify(self.promocodeName).replace("-", "_")

            # regenerate slug only if name changed
            if self.slug != new_slug:
                self.slug = new_slug

        super().save(*args, **kwargs)

    
    
class PrivacyPolicy(models.Model): 
    POLICY_TYPE_CHOICES = [
        ("terms_and_conditions", "Terms and Conditions"),
        ("privacy_and_policy", "Privacy and Policy"),
        ("agreement", "Agreement"),
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
        choices=TABLE_TYPE_CHOICES,
        default='table'
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
        if self.title:
            new_slug = slugify(self.title).replace("-", "_")

            # regenerate slug only if name changed
            if self.slug != new_slug:
                self.slug = new_slug

        super().save(*args, **kwargs)


class SpecialCondition(models.Model):
    CONDITION_TYPE_CHOICES = (
        ("corporate", "Corporate Standard"),
        ("wholesale", "Wholesale Partner"),
        ("enterprise", "Global Enterprise"),
    )
    title = models.CharField( max_length=100,help_text="Display title (e.g. Corporate Standard)")
 
    condition_type = models.CharField(
        max_length=20,
        choices=CONDITION_TYPE_CHOICES,
        unique=True
    )
 
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Short description shown under title"
    )
 
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Discount in percentage (e.g. 15.00)"
    )
 
    priority_support = models.BooleanField(default=False)
    net_30_terms = models.BooleanField(default=False)
    free_samples = models.BooleanField(default=False)
 
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
 
    class Meta:
        ordering = ["-created_at"]
 
    def __str__(self):
        return f"{self.title} - {self.discount_percentage}%"   

 
   
class QuotationTemplate(models.Model):
 
    TITLE_CHOICES = (
        ("quotation", "Quotation"),
        ("invoice", "Invoice"),
        ("email", "Email"),
    )
 
    title = models.CharField(max_length=50,choices=TITLE_CHOICES )
    slug = models.SlugField(unique=True, help_text="example: quotation-default")

    content = models.TextField(help_text="Use placeholders like {CLIENT_NAME}, {ITEM_TYPE}")
 
    userType = models.CharField( max_length=50, default="admin")
 
    language = models.CharField(max_length=10,default="en")
 
    version = models.CharField(max_length=20,blank=True, null=True)
 
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
 
    def __str__(self):
        return f"{self.slug} ({self.language})"



class AdminNotification(models.Model):
    PRIORITY_CHOICES = (
        ("high", "High"),
        ("medium", "Medium"),
        ("low", "Low"),
    )

    content_type = models.ForeignKey(ContentType,on_delete=models.CASCADE)
    object_id = models.CharField(max_length=100)
    content_object = GenericForeignKey("content_type", "object_id") 
    title = models.CharField(max_length=255)
    message = models.TextField()
    priority = models.CharField(max_length=10,choices=PRIORITY_CHOICES,default="low")
    is_seen = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
 
    def __str__(self):
        return self.title
        
        
class InspectionItem(models.Model):
    RESULT_CHOICES = [
        ("pass", "Pass"),
        ("fail", "Fail"),
        ("pending", "Pending"),
    ]
    rental_item = models.ForeignKey("userhub.RentalItem", on_delete=models.CASCADE, related_name="inspections", null=True, blank=True)
    order = models.ForeignKey("userhub.Order", on_delete=models.CASCADE, related_name="inspections", null=True, blank=True)
    returned_qty = models.PositiveIntegerField(default=0)
    good_qty = models.PositiveIntegerField(default=0)
    damaged_qty = models.PositiveIntegerField(default=0)
    missing_qty = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True, null=True)
    result = models.CharField(max_length=20, choices=RESULT_CHOICES, default="pending")
    inspected_at = models.DateTimeField(auto_now_add=True)
    inspected_by = models.ForeignKey(AdminUser, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Inspection for {self.rental_item or self.order}"

class DamagePhoto(models.Model):
    inspection = models.ForeignKey(InspectionItem, on_delete=models.CASCADE, related_name="photos")
    photo = models.ImageField(upload_to="damage_photos/")
    created_at = models.DateTimeField(auto_now_add=True)

class DamagedItem(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("repair", "Repair"),
        ("moved", "Moved to Available"),
    ]
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="damaged_records")
    source_inspection = models.ForeignKey(InspectionItem, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    reason = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    reported_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.product.productName} - {self.status}"

class CleaningItem(models.Model):
    STATUS_CHOICES = [
        ("cleaning", "Cleaning"),
        ("finished", "Finished"),
        ("moved", "Moved to Available"),
    ]
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="cleaning_records")
    source_rental_item = models.ForeignKey("userhub.RentalItem", on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="cleaning")
    entered_at = models.DateTimeField(auto_now_add=True)
    expected_done_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.product.productName} - {self.status}"
    

class CompensationInvoice(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("sent", "Sent"),
        ("paid", "Paid")
    ]
    order = models.ForeignKey("userhub.Order", on_delete=models.CASCADE, related_name="compensation_invoices")
    total_replacement_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_penalty_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Compensation Invoice for Order {self.order.order_id}"

class CompensationInvoiceItem(models.Model):
    ISSUE_CHOICES = [
        ("missing", "Missing"),
        ("damaged", "Damaged")
    ]
    invoice = models.ForeignKey(CompensationInvoice, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    issue_type = models.CharField(max_length=20, choices=ISSUE_CHOICES)
    quantity = models.PositiveIntegerField(default=1)
    replacement_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    penalty_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.quantity}x {self.product.productName} ({self.issue_type})"

class PricingPackage(models.Model):
    package_name = models.CharField(max_length=150)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    included_services = models.TextField(blank=True, null=True)
    setup_included = models.BooleanField(default=False)
    max_people = models.PositiveIntegerField(default=1)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.package_name

class PricingRule(models.Model):
    TAX_CHOICES = [
        ("percentage", "Percentage"),
        ("fixed", "Fixed Amount")
    ]
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="pricing_rules")
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    rush_order_multiplier = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)
    tiered_pricing_enabled = models.BooleanField(default=False)
    tax_type = models.CharField(max_length=20, choices=TAX_CHOICES, default="percentage")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Rule for {self.category.categoryName}"
    
    
    
from django.core.exceptions import ValidationError

class RentalPolicySettings(models.Model):
    """
    Global, platform-wide rental policy settings.
    Singleton — only one row should ever exist.
    """

    # --- Rental Pricing Rule (system managed, read-only, shown for reference) ---
    rental_pricing_formula_label = models.CharField(
        max_length=255,
        default="Daily Rate × Quantity × Rental Days",
        editable=False,
        help_text="Core formula for calculating rental costs — not editable"
    )

    # --- Late Fee Configuration ---
    late_fee_formula_label = models.CharField(
        max_length=255,
        default="Rental Value × Late Fee % × Days Overdue",
        help_text="Descriptive formula label shown to staff on invoices"
    )
    late_fee_rate = models.DecimalField(
        max_digits=5, decimal_places=2, default=5.00,
        help_text="Late fee rate, percent per day"
    )

    # --- Return & Delivery Settings ---
    grace_period_days = models.PositiveIntegerField(
        default=3,
        help_text="Days after event before late fees begin to apply"
    )
    flat_shipping_fee = models.DecimalField(
        max_digits=10, decimal_places=2, default=150.00,
        help_text="Fixed delivery and pickup charge applied once per event"
    )

    # --- Tax Settings ---
    enable_consumption_tax = models.BooleanField(
        default=True,
        help_text="Apply sales tax to all taxable transactions"
    )
    tax_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=10.00,
        help_text="Consumption tax percentage applied to taxable rentals"
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Rental Policy Settings"
        verbose_name_plural = "Rental Policy Settings"

    def save(self, *args, **kwargs):
        # enforce singleton: always overwrite pk=1
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass  # prevent deletion of the singleton row

    @classmethod
    def load(cls):
        """Fetch the single settings row, creating it with defaults if missing."""
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "Rental Policy Settings"    
