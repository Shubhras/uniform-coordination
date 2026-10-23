from django.db import migrations, models

def update_existing_currency(apps, schema_editor):
    SystemSettings = apps.get_model('uniformAdmin', 'SystemSettings')
    SystemSettings.objects.filter(default_currency__icontains='JPY').update(default_currency='USD ($)')

class Migration(migrations.Migration):

    dependencies = [
        ('uniformAdmin', '0026_adminuser_lockout'),
    ]

    operations = [
        migrations.AlterField(
            model_name='systemsettings',
            name='default_currency',
            field=models.CharField(default='USD ($)', max_length=50),
        ),
        migrations.RunPython(update_existing_currency, migrations.RunPython.noop),
    ]

