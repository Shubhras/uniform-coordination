from django.test import TestCase
from rest_framework import serializers
from uniformAdmin.models import Category, SubCategory, Fabric
from uniformAdmin.serializers import FabricSerializer

class FabricSerializerTestCase(TestCase):
    def setUp(self):
        self.category1 = Category.objects.create(
            categoryName="Category 1",
            type="uniform"
        )
        self.category2 = Category.objects.create(
            categoryName="Category 2",
            type="uniform"
        )
        self.subcategory1 = SubCategory.objects.create(
            name="SubCategory 1",
            category=self.category1,
            type="uniform"
        )
        self.subcategory2 = SubCategory.objects.create(
            name="SubCategory 2",
            category=self.category2,
            type="uniform"
        )

    def test_valid_fabric_with_category_and_subcategory(self):
        data = {
            "fabricName": "Silk Satin",
            "color": "#FFFFFF",
            "materialType": "silk",
            "fabricType": "uniform",
            "category_id": self.category1.id,
            "subcategory_id": self.subcategory1.id
        }
        serializer = FabricSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        fabric = serializer.save()
        self.assertEqual(fabric.category, self.category1)
        self.assertEqual(fabric.subcategory, self.subcategory1)

    def test_invalid_subcategory_parent_category(self):
        data = {
            "fabricName": "Silk Satin",
            "color": "#FFFFFF",
            "materialType": "silk",
            "fabricType": "uniform",
            "category_id": self.category1.id,
            "subcategory_id": self.subcategory2.id
        }
        serializer = FabricSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("subcategory", serializer.errors)
