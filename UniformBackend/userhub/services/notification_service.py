# # # userhub/services/notification_service.py

# # import requests
# # from django.conf import settings
# # from userhub.models import Notifications, UserDevice


# # # --------------------------------------------------
# # # STEP 1: Permission Gate (MOST IMPORTANT)
# # # --------------------------------------------------
# # def can_send_notification(user, notification_type):
# #     """
# #     Checks whether a notification is allowed to be sent.
# #     """

# #     if not user.isActive:
# #         return False

# #     if not user.push_notifications:
# #         return False

# #     return Notifications.objects.filter(
# #         user=user,
# #         type=notification_type,
# #         is_enabled=True,
# #         isActive=True,
# #         isDeleted=False
# #     ).exists()


# # # --------------------------------------------------
# # # STEP 2: OneSignal Sender (DELIVERY ONLY)
# # # --------------------------------------------------
# # def send_push(player_ids, title, message, data=None):
# #     url = "https://onesignal.com/api/v1/notifications"

# #     payload = {
# #         "app_id": settings.ONESIGNAL_APP_ID,
# #         "include_player_ids": list(player_ids),
# #         "headings": {"en": title},
# #         "contents": {"en": message},
# #         "data": data or {}
# #     }

# #     headers = {
# #         "Authorization": f"Basic {settings.ONESIGNAL_API_KEY}",
# #         "Content-Type": "application/json"
# #     }

# #     response = requests.post(
# #         url,
# #         json=payload,
# #         headers=headers,
# #         timeout=10
# #     )

# #     response.raise_for_status()
# #     return response.json()


# # # --------------------------------------------------
# # # STEP 3: MAIN FUNCTION (USE THIS EVERYWHERE)
# # # --------------------------------------------------
# # def send_push_to_user(user, notification_type, title, message, data=None):
# #     """
# #     Call this function whenever you want to send a push.
# #     """

# #     if not can_send_notification(user, notification_type):
# #         return None

# #     player_ids = UserDevice.objects.filter(
# #         user=user,
# #         is_active=True
# #     ).values_list("onesignal_player_id", flat=True)

# #     if not player_ids:
# #         return None

# #     return send_push(player_ids, title, message, data)



##
# # # userhub/services/notification_service.py


# from userhub.models import Notifications, NOTIFICATION_TYPE_CHOICES

# def create_default_notification_preferences(user):
#     for notif_type, _ in NOTIFICATION_TYPE_CHOICES:
#         Notifications.objects.get_or_create(
#             user=user,
#             type=notif_type,
#             defaults={
#                 "is_enabled": True,
#                 "isActive": True,
#                 "isDeleted": False
#             }
#         )
