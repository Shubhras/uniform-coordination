from django.db import models
from uniformAdmin.models import Role

class Users(models.Model):
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
    email = models.EmailField(unique=True, blank=True, null=True)
    password = models.CharField(max_length=255)  
    phone = models.CharField(max_length=20,blank=True, null=True)
    userName = models.CharField(max_length=255, null=True,blank=True)
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
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
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
 
    def save(self, *args, **kwargs):
        """Assign default role 'user' if not provided"""

        """Ensure at least one address is present before saving."""
        if not self.role:
            self.role, _ = Role.objects.get_or_create(role_name="user")
        super().save(*args, **kwargs)
 
    def __str__(self):
        return self.email

    @property
    def is_authenticated(self):
        return True  




# class Simulation(models.Model):
#     user = models.ForeignKey(Users, on_delete=models.CASCADE)

#     title = models.CharField(max_length=255)
#     category = models.CharField(max_length=100)
#     previewImage = models.ImageField(upload_to="simulation_previews/")
#     pdfFile = models.FileField(upload_to="simulation_pdfs/")

#     createdAt = models.DateTimeField(auto_now_add=True)
#     updatedAt = models.DateTimeField(auto_now=True)

#     # Optional: JSON data of canvas
#     config = models.JSONField(null=True, blank=True)
