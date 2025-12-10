from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission
from django.db import models
from django.utils.text import slugify
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

        return self.create_user(email, password, **extra)


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

