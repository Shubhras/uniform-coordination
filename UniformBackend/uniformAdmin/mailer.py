"""
Central mailer — every outgoing email follows the admin's System Settings.

Before this, SMTP host/credentials and the From address were fixed in settings.py,
and the notification toggles in System Settings were never consulted. So switching
a notification off in the admin panel had no effect, and changing the sender meant
a code deploy.

Behaviour:

  * SMTP connection is built from SystemSettings when `email_host` is filled in,
    otherwise it falls back to settings/env. An untouched install keeps working.
  * The From address/name and Reply-To come from System Settings when set.
  * `notification` names a toggle; when the admin has switched it off, send_email()
    returns False and sends nothing.
  * The admin footer note is appended to HTML bodies.

Usage
-----
    from uniformAdmin.mailer import send_email, admin_recipients

    send_email(
        subject="Quotation QUO26-00001",
        to=[customer.email],
        html_body=rendered_html,
        notification="customer_on_status_change",
    )
"""

import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives, get_connection

logger = logging.getLogger(__name__)

# Short name -> SystemSettings field. Keeps call sites readable and means a typo
# raises here instead of silently disabling an email.
NOTIFICATION_FLAGS = {
    "admin_on_new_request": "notify_admin_on_new_request",
    "customer_on_registration": "notify_customer_on_registration",
    "customer_on_request_received": "notify_customer_on_request_received",
    "customer_on_status_change": "notify_customer_on_status_change",
}


def get_settings():
    """SystemSettings singleton, or None if it cannot be loaded."""
    try:
        from uniformAdmin.models import SystemSettings

        return SystemSettings.load()
    except Exception:  # noqa: BLE001 - never let settings lookup break sending
        logger.exception("Could not load SystemSettings; falling back to env config")
        return None


def is_enabled(notification, config=None):
    """True when this notification type may be sent."""
    if not notification:
        return True

    field = NOTIFICATION_FLAGS.get(notification)
    if not field:
        raise ValueError(
            f"Unknown notification {notification!r}. "
            f"Valid names: {', '.join(sorted(NOTIFICATION_FLAGS))}"
        )

    config = config or get_settings()
    if config is None:
        # No settings row — default to sending rather than silently swallowing mail.
        return True
    return bool(getattr(config, field, True))


def build_connection(config=None):
    """
    An SMTP connection using the admin's settings when provided.

    Returning None means "use Django's default connection", which is what the
    fallback path wants.
    """
    config = config or get_settings()
    if config is None or not getattr(config, "email_host", None):
        return None

    return get_connection(
        backend="django.core.mail.backends.smtp.EmailBackend",
        host=config.email_host,
        port=config.email_port or 587,
        username=config.email_username or "",
        password=config.email_password or "",
        use_tls=bool(config.email_use_tls),
    )


def from_address(config=None):
    """`Name <address>` per admin settings, falling back to env config."""
    config = config or get_settings()

    address = (getattr(config, "email_sender_address", None) or "").strip() if config else ""
    if not address:
        # Django's DEFAULT_FROM_EMAIL defaults to 'webmaster@localhost', which is
        # never a real mailbox. Prefer the configured SMTP user over that placeholder.
        default_from = getattr(settings, "DEFAULT_FROM_EMAIL", "") or ""
        if default_from and default_from != "webmaster@localhost":
            address = default_from
        else:
            address = getattr(settings, "EMAIL_HOST_USER", "") or default_from

    name = (getattr(config, "email_sender_name", None) or "").strip() if config else ""
    return f"{name} <{address}>" if name and address else address


def admin_recipients(config=None):
    """Parsed admin_notification_emails list."""
    config = config or get_settings()
    raw = (getattr(config, "admin_notification_emails", None) or "") if config else ""
    return [a.strip() for a in raw.split(",") if a.strip()]


def _with_footer(html_body, config):
    footer = (getattr(config, "email_footer_note", None) or "").strip() if config else ""
    if not html_body or not footer:
        return html_body
    safe = footer.replace("\n", "<br/>")
    return (
        f"{html_body}"
        f'<hr style="margin-top:24px;border:none;border-top:1px solid #E2E8F0"/>'
        f'<div style="color:#64748B;font-size:12px">{safe}</div>'
    )


def send_email(
    subject,
    to,
    html_body=None,
    text_body=None,
    notification=None,
    cc=None,
    bcc=None,
    reply_to=None,
    attachments=None,
    fail_silently=False,
):
    """
    Send one email through the admin-configured connection.

    Returns True when handed to the mail backend, False when suppressed by an
    admin toggle or when there is no recipient. Raises on delivery failure unless
    `fail_silently` is set, so callers can distinguish "off" from "broken".
    """
    recipients = [t for t in (to if isinstance(to, (list, tuple)) else [to]) if t]
    if not recipients:
        logger.warning("send_email called with no recipients (subject=%r)", subject)
        return False

    config = get_settings()

    if not is_enabled(notification, config):
        logger.info(
            "Notification %r is disabled in System Settings; skipping %r",
            notification, subject,
        )
        return False

    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body or "Please view this email in an HTML-capable client.",
        from_email=from_address(config),
        to=recipients,
        cc=cc or None,
        bcc=bcc or None,
        reply_to=[reply_to] if reply_to else (
            [config.email_reply_to] if config and config.email_reply_to else None
        ),
        connection=build_connection(config),
    )

    if html_body:
        message.attach_alternative(_with_footer(html_body, config), "text/html")

    for attachment in attachments or []:
        # (filename, content, mimetype)
        message.attach(*attachment)

    message.send(fail_silently=fail_silently)
    return True


def notify_admins(subject, html_body=None, text_body=None, notification="admin_on_new_request"):
    """Send an internal alert to the admin recipients from System Settings."""
    recipients = admin_recipients()
    if not recipients:
        logger.info("No admin_notification_emails configured; skipping %r", subject)
        return False

    return send_email(
        subject=subject,
        to=recipients,
        html_body=html_body,
        text_body=text_body,
        notification=notification,
    )
