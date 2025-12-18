
# #userhub/services/device_service.py


# from userhub.models import UserDevice

# def register_or_update_device(user, player_id, device_type):
#     return UserDevice.objects.update_or_create(
#         onesignal_player_id=player_id,
#         defaults={
#             "user": user,
#             "device_type": device_type,
#             "is_active": True
#         }
#     )
