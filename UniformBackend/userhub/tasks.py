from celery import shared_task
from .utils import send_login_alert_email


@shared_task
def send_login_alert_email_task(user_id):
    from .models import Users

    try:
        user = Users.objects.get(id=user_id)
        send_login_alert_email(user)
    except Users.DoesNotExist:
        pass