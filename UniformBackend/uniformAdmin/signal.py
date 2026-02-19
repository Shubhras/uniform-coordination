from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import AdminNotification
from userhub.models import *


# def create_quotation_notification(sender, instance, created, **kwargs):
#     if created:
#         AdminNotification.objects.create(
#             content_type=ContentType.objects.get_for_model(instance),
#             object_id=instance.id,
#             title=f"New Quotation Request: {instance.quotation_id}",
#             message=f"A new quotation request has been created by {instance.company_name}.",
#             priority="high"
#         )
#     else:
#         AdminNotification.objects.create(
#             content_type=ContentType.objects.get_for_model(instance),
#             object_id=instance.id,
#             title=f"Quotation Updated: {instance.quotation_id}",
#             message=f"The quotation request by {instance.company_name} has been updated.",
#             priority="medium"
#         )


def create_admin_notification(instance, title, message, priority="low"):
    """
    Generic function to create admin notification for any model instance.
    """
    AdminNotification.objects.create(
        content_type=ContentType.objects.get_for_model(instance),
        object_id=str(instance.quotation_id),
        title=title,
        message=message,
        priority=priority
    )



def create_admin_order_notification(instance,object_id, title, message, priority="low"):
    """
    Generic function to create admin notification for any model instance.
    """
    AdminNotification.objects.create(
        content_type=ContentType.objects.get_for_model(instance),
        object_id=object_id,
        title=title,
        message=message,
        priority=priority
    )

