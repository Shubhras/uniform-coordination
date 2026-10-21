# Generated manually for FA-006 AdminUser account lockout

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('uniformAdmin', '0029_merge'),
    ]

    operations = [
        migrations.AddField(
            model_name='adminuser',
            name='failed_login_attempts',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='adminuser',
            name='locked_until',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
