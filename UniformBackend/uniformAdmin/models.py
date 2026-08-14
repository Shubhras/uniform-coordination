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

    # Job title shown on the Sales Team Performance cards, e.g. "Sales Executive".
    # Free text because the UI shows several titles under one `sales` role.
    designation = models.CharField(max_length=100, blank=True, null=True)

    # Which sales rep owns this B2B account. Self-referential because B2B accounts
    # and sales reps are both AdminUser rows, distinguished by their role.
    assigned_sales_rep = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_accounts",
    )

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
    # Client feedback 2026-08-06: system currency is USD globally.
    default_currency = models.CharField(max_length=50, default="USD ($)")
    time_zone = models.CharField(max_length=100, default="(GMT+09:00) Tokyo")
    date_format = models.CharField(max_length=50, default="YYYY/MM/DD")
    
    logo = models.ImageField(upload_to="system/logos/", null=True, blank=True)

    # ---------------- Payment & Billing Terms ----------------
    # KIREIZ FORM does not process payments (spec: the flow ends at the quotation
    # request), so there is deliberately no gateway/credential config here. These
    # are the billing terms printed on quotations and quotation PDFs.
    payment_terms = models.TextField(
        blank=True,
        null=True,
        help_text="Terms printed on quotations, e.g. '50% advance payment required.'",
    )
    quotation_validity_days = models.PositiveSmallIntegerField(
        default=30,
        help_text="Default number of days a quotation stays valid.",
    )
    tax_rate = models.DecimalField(
        max_digits=5, decimal_places=2, default=10,
        help_text="Consumption tax percentage shown on quotations.",
    )
    tax_inclusive = models.BooleanField(
        default=False,
        help_text="Whether quoted figures already include tax.",
    )
    bank_name = models.CharField(max_length=150, blank=True, null=True)
    bank_branch = models.CharField(max_length=150, blank=True, null=True)
    bank_account_name = models.CharField(max_length=150, blank=True, null=True)
    bank_account_number = models.CharField(max_length=50, blank=True, null=True)

    # ---------------- Email & Notifications ----------------
    # SMTP connection. Left blank, the mailer falls back to the values in
    # settings/env — so an untouched install keeps working exactly as before.
    # Filling these in makes the admin panel the source of truth instead.
    email_host = models.CharField(max_length=255, blank=True, null=True)
    email_port = models.PositiveIntegerField(blank=True, null=True)
    email_use_tls = models.BooleanField(default=True)
    email_username = models.CharField(max_length=255, blank=True, null=True)
    email_password = models.CharField(max_length=255, blank=True, null=True)

    email_sender_name = models.CharField(max_length=150, blank=True, null=True)
    email_sender_address = models.EmailField(blank=True, null=True)
    email_reply_to = models.EmailField(blank=True, null=True)
    email_footer_note = models.TextField(blank=True, null=True)
    # Comma-separated list of admins who receive internal alerts.
    admin_notification_emails = models.TextField(blank=True, null=True)

    notify_admin_on_new_request = models.BooleanField(default=True)
    notify_admin_on_new_registration = models.BooleanField(default=True)
    notify_admin_on_login = models.BooleanField(default=True)
    notify_customer_on_registration = models.BooleanField(default=True)
    notify_customer_on_request_received = models.BooleanField(default=True)
    notify_customer_on_status_change = models.BooleanField(default=True)

    # ---------------- System Alerts (dashboard "Active Alerts") ----------------
    # Which events raise a dashboard alert, and the SLA (days) each is timed from.
    alert_pending_review_enabled = models.BooleanField(default=True)
    alert_pending_review_sla_days = models.PositiveSmallIntegerField(default=3)
    alert_awaiting_customer_enabled = models.BooleanField(default=True)
    alert_awaiting_customer_sla_days = models.PositiveSmallIntegerField(default=3)

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
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True, related_name="fabric_category")
    subcategory = models.ForeignKey('SubCategory', on_delete=models.SET_NULL, null=True, blank=True, related_name="fabric_subcategory")
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.fabricName


class Parts(models.Model):
    
    PART_TYPE_CHOICES = [
        ('uniform', 'Uniform'),
        ('table', 'Table'),
    ]
    
    # partName = models.CharField(max_length=150, unique=True)
    partName = models.CharField(max_length=150)
    partImage = models.ImageField(upload_to='part_images/', blank=True, null=True)
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True, related_name="parts_category")
    subcategory = models.ForeignKey('SubCategory', on_delete=models.SET_NULL, null=True, blank=True, related_name="parts_subcategory")
    partType = models.CharField(max_length=20,choices=PART_TYPE_CHOICES,default='uniform')
    fabric = models.ForeignKey(Fabric, on_delete=models.CASCADE)
    usageTemmpCount = models.IntegerField(default=0)
    theme = models.ForeignKey('TableTheme',on_delete=models.SET_NULL,null=True,blank=True,related_name="parts")
    zIndex = models.IntegerField(default=0)

    # --- Canvas simulation layer registration ---
    # Pixel offset of this part image from the canvas origin. Every layered-canvas
    # approach needs this regardless of how colour is applied (pre-rendered image
    # swap vs. tinting a mask), so it is safe to model before that decision lands.
    offsetX = models.IntegerField(default=0)
    offsetY = models.IntegerField(default=0)

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


class AttributeOption(models.Model):
    """
    The choices a shopper sees for one simulation attribute — the four collar styles, the
    five cuffs, the size run, and so on.

    One table rather than a Collar table, a Sleeve table and so on. The attribute set is
    admin-defined under Simulation Assets → Simulation Structure, so a per-attribute table
    would mean a migration and a new admin screen every time the client adds an attribute.
    Fabric, Parts and Colors keep their own tables because they carry their own data
    (price, material, layer order); these options carry nothing but a name and artwork.

    `attribute` matches the tool key the storefront customiser uses, which is the contract
    between the two sides.
    """

    ATTRIBUTE_CHOICES = [
        ("collar", "Collar"),
        ("sleeves", "Sleeves"),
        ("cap", "Cap"),
        ("zipper", "Zipper"),
        ("cuff", "Cuff"),
        ("pocket", "Pocket"),
        ("pants", "Pant"),
        ("aprons", "Apron"),
        ("size", "Size"),
    ]

    attribute = models.CharField(max_length=30, choices=ATTRIBUTE_CHOICES)
    name = models.CharField(max_length=150)

    # Optional because Size is a run of labels (XS…XXXL) with nothing to picture.
    image = models.ImageField(upload_to="attribute_options/", blank=True, null=True)

    # Null means the option is offered in every category. Same rule as fabrics, so the two
    # behave alike rather than each having its own idea of scope.
    category = models.ForeignKey(
        "Category",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="attribute_options",
    )

    order = models.PositiveIntegerField(default=0)
    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["attribute", "order", "id"]

    def __str__(self):
        return f"{self.get_attribute_display()}: {self.name}"


class Template(models.Model):
    templateName = models.CharField(max_length=250)
    templateImage = models.ImageField(upload_to='template_images/', blank=True, null=True)
    part = models.ForeignKey(Parts, on_delete=models.SET_NULL, null=True, blank=True)

    # The industry this template is offered under — Medical & Nursing Care, Food Service
    # & Dining, and so on. Needed because `part` leads to a part category (Pockets, Caps),
    # which says nothing about which storefront page the template belongs on.
    # Quoted reference: Category is declared further down this module.
    category = models.ForeignKey(
        "Category",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="templates",
    )

    # Bullet points shown on the customer template card, e.g.
    # ["Premium Cotton Blend", "Executive Style"]. A list rather than fixed columns so the
    # admin is not forced into exactly four.
    specifications = models.JSONField(default=list, blank=True)

    # A template is a *style*, not a garment: the shopper picks the template, then picks
    # which product in this category to apply it to. So there is deliberately no product
    # link here — one template serves every product in its category, and each design still
    # ends up against a single product, which is what the quotation line items expect.
    #
    # The preset below is what gets pre-selected in the design tool. Only colour and
    # fabric are here because they are the attributes the admin actually keeps tables for;
    # collar, sleeve, cap and the rest have no admin source, so a template cannot set them.
    # The starting part is `part` above, which this model already carries.
    preset_color = models.ForeignKey(
        "Colors",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="templates",
    )
    preset_fabric = models.ForeignKey(
        "Fabric",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="templates",
    )

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
    bannerImage = models.ImageField(upload_to="category/banner/", blank=True, null=True)
    description = models.CharField(max_length=250,blank=True, null=True)
    type = models.CharField(max_length=20,choices=CATEGORY_TYPE,default='uniform')    
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

    def __str__(self):
        return self.categoryName
    
    
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
    type = models.CharField(max_length=20,choices=BLOG_TYPE_CHOICES,default='uniform')
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

 
 
 
class FAQ(models.Model):
    FAQ_TYPE_CHOICES = (
        ('uniform', 'Uniform'),
        ('table', 'Table'),
    )
    title = models.CharField(max_length=255,unique=True)
    # description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=20,choices=FAQ_TYPE_CHOICES,default='uniform')
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
    type = models.CharField(max_length=20,choices=SUBCATEGORY_TYPE,default='uniform')
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

    def __str__(self):
        return self.name

    
    
class TableTheme(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to="table_themes/")
    order = models.PositiveIntegerField(default=0, db_index=True,blank=True, null=True) 
    is_active = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return self.title



class Product(models.Model):
    productType = [ 
    ('uniform', 'Uniform'),
    ('table', 'Table'),
    ]
    type_CHOICES = [
        ("top", "Top"),
        ("bottom", "Bottom"),
        ("set", "Set"),
        
    ]
    productName = models.CharField(max_length=255)
    slug = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    productType = models.CharField(max_length=20,choices=productType,default='uniform' ,blank=True, null=True)
    type = models.CharField(max_length=30, choices=type_CHOICES, default="set")
    theme = models.ForeignKey(TableTheme,on_delete=models.SET_NULL,null=True,blank=True,related_name="products")
    category = models.ForeignKey(Category,on_delete=models.SET_NULL,null=True,related_name="product_category")
    subcategory = models.ForeignKey(SubCategory,on_delete=models.SET_NULL, null=True,related_name="product_subcategory")
    parts = models.ManyToManyField(Parts,related_name="products_parts",blank=True)

    # Admin controls whether this product is offered in the customer simulation.
    # Mirrors Product.show_in_simulation on the KIREIZ SPACE side so both platforms
    # gate the simulation catalogue the same way.
    show_in_simulation = models.BooleanField(default=True)
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
    rfid_tracking_enabled = models.BooleanField(default=False)
    
    rental_price_per_day = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    security_deposit = models.DecimalField(
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
 
    PAGE_SIZE_CHOICES = (
        ("A4", "A4"),
        ("Letter", "Letter"),
    )

    title = models.CharField(max_length=50,choices=TITLE_CHOICES )
    slug = models.SlugField(unique=True, help_text="example: quotation-default")

    # Display name shown in the admin PDF Template Library, e.g. "Standard quotation".
    # Free text, unlike `title` which is a fixed category.
    name = models.CharField(max_length=150, blank=True, default="")
    page_size = models.CharField(max_length=20, choices=PAGE_SIZE_CHOICES, default="A4")
    # Drives the drag-to-reorder order in the template library.
    sort_order = models.PositiveIntegerField(default=0)

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


class DashboardAlertRead(models.Model):
    """
    Tracks which dashboard Active Alerts an admin has marked as read.

    The alerts are computed live from quotation counts, so there is no alert row to
    flag. Instead we store the fingerprint of what the alert said when it was
    dismissed. If the underlying numbers later change, the fingerprint no longer
    matches and the alert surfaces again — which is what a dashboard alert should do.
    """

    admin = models.ForeignKey(
        AdminUser,
        on_delete=models.CASCADE,
        related_name="dashboard_alert_reads",
    )
    alert_type = models.CharField(max_length=50)
    fingerprint = models.CharField(max_length=255)
    read_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["admin", "alert_type"],
                name="unique_admin_dashboard_alert_read",
            )
        ]

    def __str__(self):
        return f"{self.admin_id} - {self.alert_type}"


class PdfPageTemplate(models.Model):
    """
    Page-format presets for simulation/PDF exports (A4, Letter, custom canvas...).

    Distinct from QuotationTemplate: that stores HTML *content*, this describes the
    physical page the output is rendered onto.
    """

    UNIT_CHOICES = (
        ("mm", "Millimetres"),
        ("in", "Inches"),
        ("px", "Pixels"),
    )

    name = models.CharField(max_length=150)
    width = models.DecimalField(max_digits=10, decimal_places=2)
    height = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=5, choices=UNIT_CHOICES, default="mm")
    # Short badge shown on the card, e.g. "A4", "Letter", "Custom".
    tag = models.CharField(max_length=30, blank=True, default="")
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "id"]

    @property
    def dimension_label(self):
        def trim(value):
            # 210.00 -> "210", 8.50 -> "8.5"
            return f"{value.normalize():f}".rstrip("0").rstrip(".") if value else "0"

        return f"{trim(self.width)} × {trim(self.height)} {self.unit}"

    def __str__(self):
        return f"{self.name} ({self.dimension_label})"


class SimulationExportSetting(models.Model):
    """
    Singleton holding the admin's export configuration for simulation output.
    Only one row should ever exist (pk forced to 1).
    """

    FORMAT_CHOICES = (
        ("pdf", "PDF"),
        ("png", "PNG"),
        ("jpg", "JPG"),
    )

    DPI_CHOICES = (
        (72, "72 DPI (Screen)"),
        (150, "150 DPI (Web High Quality)"),
        (300, "300 DPI (Print)"),
    )

    selected_template = models.ForeignKey(
        PdfPageTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="export_settings",
    )
    output_format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default="pdf")
    compression_quality = models.PositiveSmallIntegerField(default=50)
    dpi = models.PositiveSmallIntegerField(choices=DPI_CHOICES, default=72)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Simulation Export Setting"
        verbose_name_plural = "Simulation Export Settings"

    def save(self, *args, **kwargs):
        # Enforce singleton, same pattern as SystemSettings above.
        self.pk = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.output_format} @ {self.dpi} DPI"


class SimulationStructure(models.Model):
    """
    Which attributes the customer simulation shows for a category, and in what order.

    Mirrors SimulationStructure on the KIREIZ SPACE side so both platforms configure
    the simulation the same way. `structure_data` holds:

        {"attributes": [{"attribute": "Fabric", "enabled": true, "order": "1"}, ...]}

    Kept as JSON rather than a table of rows because the attribute set is admin-defined
    free text — the admin can add or remove attributes per category without a migration.
    """

    category = models.OneToOneField(
        Category, on_delete=models.CASCADE, related_name="simulation_structure"
    )
    structure_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Simulation Structure for {self.category.categoryName}"


class DocumentCounter(models.Model):
    """
    Running number source for automated document codes (QUOyy-00001, SOyy-00001).

    A dedicated counter row per (doc_type, year) rather than deriving the next
    number from MAX(existing) at insert time: two concurrent requests reading the
    same MAX would both claim the same number. Callers take a row lock via
    next_code(), so the sequence is safe under concurrency.

    The year is part of the key, so numbering restarts at 00001 each calendar year.
    """

    doc_type = models.CharField(max_length=10, help_text="QUO, SO, ...")
    year = models.PositiveSmallIntegerField(help_text="4-digit year")
    last_number = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["doc_type", "year"], name="unique_document_counter"
            )
        ]

    def __str__(self):
        return f"{self.doc_type}{str(self.year)[-2:]} @ {self.last_number}"

    @classmethod
    def next_code(cls, doc_type, when=None, width=5):
        """
        Reserve and return the next code, e.g. next_code("QUO") -> 'QUO26-00001'.

        Must be called inside a transaction for the lock to hold; it opens its own
        atomic block so callers don't have to.
        """
        from django.db import transaction
        from django.utils.timezone import now as _now

        moment = when or _now()
        year = moment.year

        with transaction.atomic():
            counter, _ = cls.objects.get_or_create(
                doc_type=doc_type, year=year, defaults={"last_number": 0}
            )
            # Lock this counter row so concurrent callers queue instead of racing.
            counter = cls.objects.select_for_update().get(pk=counter.pk)
            counter.last_number += 1
            counter.save(update_fields=["last_number", "updated_at"])
            number = counter.last_number

        return f"{doc_type}{str(year)[-2:]}-{number:0{width}d}"

    @classmethod
    def sync_from_existing(cls, doc_type, year, highest):
        """
        Raise a counter so it never re-issues a code that already exists.

        Needed after importing a dump: the rows arrive but the counter table may be
        behind (or empty), which would otherwise cause duplicate-key errors.
        """
        counter, _ = cls.objects.get_or_create(
            doc_type=doc_type, year=year, defaults={"last_number": 0}
        )
        if highest > counter.last_number:
            counter.last_number = highest
            counter.save(update_fields=["last_number", "updated_at"])
        return counter
