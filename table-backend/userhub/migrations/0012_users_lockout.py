# Generated manually for FA-006 Users account lockout

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('userhub', '0011_usernotification'),
    ]

    operations = [
        migrations.AddField(
            model_name='users',
            name='failed_login_attempts',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='users',
            name='locked_until',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
