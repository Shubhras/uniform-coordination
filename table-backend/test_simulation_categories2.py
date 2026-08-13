import os
import sys
import django

sys.path.append('/home/dell/Documents/Uniform/uniform-coordination/table-backend')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "UniformWeb.settings")
django.setup()

from uniformAdmin.models import SimulationStructure

for s in SimulationStructure.objects.all():
    print(f"ID: {s.id}, Category: {s.category}, Icon: {s.icon}")

