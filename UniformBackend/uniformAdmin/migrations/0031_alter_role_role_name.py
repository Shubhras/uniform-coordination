from django.db import migrations, models


def create_initial_roles(apps, schema_editor):
    Role = apps.get_model('uniformAdmin', 'Role')
    roles = [
        ("admin", "Admin role with full access"),
        ("manager", "Manager with operational oversight"),
        ("editor", "Content and catalog editor"),
        ("operations", "Operations and order management"),
        ("accountant", "Accountant and financial reporting"),
        ("staff", "Internal staff"),
        ("sales", "Sales Representative"),
        ("b2b_user", "Uniform B2B Customer Account"),
        ("b2b", "Uniform B2B Customer Account"),
        ("b2c", "Table B2C Customer Account"),
        ("customer", "Standard Customer"),
    ]
    for role_name, desc in roles:
        Role.objects.get_or_create(
            role_name=role_name,
            defaults={"slug": role_name.replace("_", "-"), "description": desc}
        )


class Migration(migrations.Migration):

    dependencies = [
        ('uniformAdmin', '0030_adminuser_lockout'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='role_name',
            field=models.CharField(choices=[('admin', 'Admin'), ('manager', 'Manager'), ('editor', 'Editor'), ('operations', 'Operations'), ('accountant', 'Accountant'), ('staff', 'Staff'), ('sales_rep', 'Sales Rep'), ('sales', 'Sales Rep'), ('corporate', 'Corporate'), ('customer', 'Customer'), ('b2b', 'B2B'), ('b2b_user', 'B2B User'), ('b2c', 'B2C')], max_length=60),
        ),
        migrations.RunPython(create_initial_roles, migrations.RunPython.noop),
    ]
