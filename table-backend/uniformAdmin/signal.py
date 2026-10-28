from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import AdminNotification
from userhub.models import *


def create_admin_notification(instance, title, message, priority="low"):
    """
    Generic function to create admin notification for any model instance.
    """
    try:
        obj_id = getattr(instance, "pk", "")
        AdminNotification.objects.create(
            content_type=ContentType.objects.get_for_model(instance),
            object_id=str(obj_id),
            title=title,
            message=message,
            priority=priority
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to create admin notification: {e}")


def create_admin_order_notification(instance, object_id, title, message, priority="low"):
    """
    Generic function to create admin notification for order instance.
    """
    try:
        obj_id = getattr(instance, "pk", object_id)
        AdminNotification.objects.create(
            content_type=ContentType.objects.get_for_model(instance),
            object_id=str(obj_id),
            title=title,
            message=message,
            priority=priority
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to create admin order notification: {e}")


@receiver(post_save, sender=QuotationRequest)
def quotation_notification_receiver(sender, instance, created, **kwargs):
    try:
        if created:
            AdminNotification.objects.create(
                content_type=ContentType.objects.get_for_model(instance),
                object_id=str(instance.pk),
                title=f"New Quotation Request: {instance.quotation_id}",
                message=f"A new quotation request has been created by {getattr(instance, 'company_name', 'Client')}.",
                priority="high"
            )
        else:
            AdminNotification.objects.create(
                content_type=ContentType.objects.get_for_model(instance),
                object_id=str(instance.pk),
                title=f"Quotation Updated: {instance.quotation_id}",
                message=f"The quotation request {instance.quotation_id} has been updated.",
                priority="medium"
            )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Quotation notification error: {e}")


@receiver(post_save, sender=Order)
def order_notification_receiver(sender, instance, created, **kwargs):
    try:
        if created:
            AdminNotification.objects.create(
                content_type=ContentType.objects.get_for_model(instance),
                object_id=str(instance.pk),
                title=f"New Order Placed: {instance.order_id}",
                message=f"Order {instance.order_id} has been placed for total ${instance.total_amount}.",
                priority="high"
            )
        elif kwargs.get("update_fields") and "is_paid" in kwargs.get("update_fields") and instance.is_paid:
            AdminNotification.objects.create(
                content_type=ContentType.objects.get_for_model(instance),
                object_id=str(instance.pk),
                title=f"Order Payment Received: {instance.order_id}",
                message=f"Payment received for order {instance.order_id}.",
                priority="medium"
            )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Order notification error: {e}")



