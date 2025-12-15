from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
import re
from .models import *
# User = get_user_model()

class AdminLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    remember_me = serializers.BooleanField(default=False)
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            raise serializers.ValidationError("Email and password are required")

        try:
            user = AdminUser.objects.get(email=email)
        except AdminUser.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials or not an admin")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials or not an admin")

        if not user.is_staff:
            raise serializers.ValidationError("User is not an admin")

        data['user'] = user
        return data


class AdminChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_new_password = serializers.CharField(write_only=True)


    def validate_new_password(self, value):
        """
        Validate strong password rules:
        - Minimum 6 characters
        - At least one letter
        - At least one number
        - At least one special character (@,#,$, etc.)
        """
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long.")
        if not re.search(r"[A-Za-z]", value):
            raise serializers.ValidationError("Password must contain at least one letter.")
        if not re.search(r"[0-9]", value):
            raise serializers.ValidationError("Password must contain at least one number.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise serializers.ValidationError("Password must contain at least one special character like @,#,$.")
        return value
    

    def validate(self, data):
        user = self.context['request'].user

        # Check current password
        if not user.check_password(data.get('current_password')):
            raise serializers.ValidationError({"current_password": "Current password is incorrect"})

        # Check new password match
        if data.get('new_password') != data.get('confirm_new_password'):
            raise serializers.ValidationError({"confirm_new_password": "New passwords do not match"})

        return data

class AdminUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminUser
        fields = ['name',"email", 'mobile', 'language','email']


class AdminDetailSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)

    class Meta:
        model = AdminUser
        exclude = ['password']
        read_only_fields = ['id',"email","name","mobile","language",'is_staff', 'is_superuser', 'last_login', 'date_joined']


class FabricSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fabric
        fields = '__all__'


class PartsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parts
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "usageTemmpCount"]


class FabricMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fabric
        fields = ["id", "fabricName"]


class ColorsSerializer(serializers.ModelSerializer):
    compatibleFabric = FabricMiniSerializer(many=True, read_only=True)
    compatibleFabric_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Colors
        fields = [
            "id",
            "colorName",
            "colorCode",
            "compatibleFabric",
            "compatibleFabric_ids",
            "isActive",
            "isDeleted",
            "created_at",
            "updated_at"
        ]

    def create(self, validated_data):
        fabric_ids = validated_data.pop("compatibleFabric_ids", [])
        color = Colors.objects.create(**validated_data)
        if fabric_ids:
            color.compatibleFabric.set(fabric_ids)
        return color

    def update(self, instance, validated_data):
        fabric_ids = validated_data.pop("compatibleFabric_ids", None)

        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        if fabric_ids is not None:
            instance.compatibleFabric.set(fabric_ids)

        return instance




class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = "__all__"
