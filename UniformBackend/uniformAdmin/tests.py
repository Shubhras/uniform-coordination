from django.test import TestCase
from django.urls import reverse
from rest_framework import serializers
from uniformAdmin.models import Category, SubCategory, Fabric, Parts, Template
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


class TemplateListFilterTestCase(TestCase):
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
        self.fabric = Fabric.objects.create(
            fabricName="Cotton Fabric",
            color="Red",
            materialType="cotton",
            fabricType="uniform",
            category=self.category1,
            subcategory=self.subcategory1
        )
        self.part1 = Parts.objects.create(
            partName="Part 1",
            category=self.category1,
            subcategory=self.subcategory1,
            partType="uniform",
            fabric=self.fabric
        )
        self.part2 = Parts.objects.create(
            partName="Part 2",
            category=self.category2,
            subcategory=self.subcategory2,
            partType="uniform",
            fabric=self.fabric
        )
        self.template1 = Template.objects.create(
            templateName="Template One",
            part=self.part1
        )
        self.template2 = Template.objects.create(
            templateName="Template Two",
            part=self.part2
        )

    def test_list_templates_no_filter(self):
        url = reverse("list-templates")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["data"]), 2)

    def test_list_templates_filter_by_part_id(self):
        url = reverse("list-templates")
        response = self.client.get(url, {"part_id": self.part1.id})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["data"]), 1)
        self.assertEqual(response.data["data"][0]["id"], self.template1.id)

    def test_list_templates_filter_by_category_id(self):
        url = reverse("list-templates")
        response = self.client.get(url, {"category_id": self.category2.id})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["data"]), 1)
        self.assertEqual(response.data["data"][0]["id"], self.template2.id)

    def test_list_templates_filter_by_subcategory_id(self):
        url = reverse("list-templates")
        response = self.client.get(url, {"subcategory_id": self.subcategory1.id})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["data"]), 1)
        self.assertEqual(response.data["data"][0]["id"], self.template1.id)
