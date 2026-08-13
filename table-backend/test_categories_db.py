import os
import sys
import django

sys.path.append('/home/dell/Documents/Uniform/uniform-coordination/table-backend')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "UniformWeb.settings")
django.setup()

from uniformAdmin.models import Category, Product

for c in Category.objects.all():
    print(f"Category ID: {c.id}, Name: {c.categoryName}, Slug: {c.slug}")
    products = Product.objects.filter(category=c, show_in_simulation=True)
    print(f"  Products in simulation: {list(products.values_list('id', 'productName'))}")

