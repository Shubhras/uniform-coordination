from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from uniformAdmin.models import AdminUser
from django.utils.timezone import now
from rest_framework.permissions import IsAuthenticated
from .utils import generate_custom_tokens
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.conf import settings
from .serializers import*
import logging,uuid
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.permissions import AllowAny
from django.utils.http import urlsafe_base64_decode


import re

logger = logging.getLogger(__name__)



class SignupAPIView(APIView):

    def post(self, request, *args, **kwargs):
        request.data._mutable = True
        request.data["userType"] = request.data.get("userType")
        serializer = UserSignupSerializer(data=request.data)

        try:
            if serializer.is_valid():
                user = serializer.save()

                # ---------------------------------------
                # EMAIL VERIFICATION 
                # ---------------------------------------
                
                uid = urlsafe_base64_encode(force_bytes(user.id))
                # verify_link = f"{settings.FRONTEND_URL}/verify-email/{uid}"
                
                verify_link = request.build_absolute_uri(f"/api/v1/userhub/verify-email/{uid}/")


                send_mail(
                    subject="Verify your email",
                    message=f"Click here to verify your email, it's you:\n{verify_link}",
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[user.email],
                    fail_silently=False
                )

                # Serialize full safe user response
                response_data = UserResponseSerializer(
                    user,
                    context={'request': request}
                ).data

                # Convert profileImage to full URL
                if user.profileImage:
                    response_data["profileImage"] = request.build_absolute_uri(user.profileImage.url)

                return Response({
                    "status": True,
                    "statusCode": 201,
                    "message": "User created successfully.",
                    "data": response_data
                }, status=status.HTTP_201_CREATED)

            else:
                # Extract first validation error message
                error_message = "Validation failed."
                

                errors = serializer.errors
                if isinstance(errors, dict):
                    for field, messages in errors.items():
                        if isinstance(messages, list) and messages:
                            error_message = f"Validation failed;{messages[0]}"
                            break
                            
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": error_message
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as exc:
            logger.exception("Signup error")
            return Response({
                "status": False,
                "statusCode": 500,
                    "message": "Server error while creating user.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class LoginAPIView(APIView):

    def post(self, request):
        try:
            email = request.data.get("email")
            password = request.data.get("password")
            user_type = request.data.get("userType")  

            # ------- CLEAN VALIDATION FIX ----------
            missing_fields = []

            if not email:
                missing_fields.append("Email is required.")
            if not password:
                missing_fields.append("Password is required.")
            if not user_type:
                missing_fields.append("User type is required.")

            # If ANY field missing → return ONLY the FIRST message
            if missing_fields:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": missing_fields[0],
                }, status=400)
            # ----------------------------------------

            serializer = LoginSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data["user"]


            # =====================================================
            #  EMAIL VERIFICATION CHECK 
            # =====================================================
            if not user.is_verify:
                return Response({
                    "status": False,
                    "statusCode": 403,
                    "message": "Please verify your email before logging in."
                }, status=403)
            # =====================================================
            

            # Check matching userType
            if user.userType != user_type:
                return Response({
                    "status": False,
                    "statusCode": 403,
                    "message": "You are not allowed to login in this section."
                }, status=403)

            # Update last login
            user.lastLogin = now()
            user.save()

            # ---------------------------------------------------------
            # CASE 1: NORMAL USER → call external custom token function
            # ---------------------------------------------------------
            if not isinstance(user, AdminUser):
                tokens = generate_custom_tokens(user)
                access_token = tokens["access"]
                refresh_token = tokens["refresh"]

            # ---------------------------------------------------------
            # CASE 2: ADMIN USER → use SimpleJWT
            # ---------------------------------------------------------
            else:
                jwt_refresh = RefreshToken.for_user(user)
                access_token = str(jwt_refresh.access_token)
                refresh_token = str(jwt_refresh)

            # User serialized data
            user_data = UserResponseSerializer(user, context={"request": request}).data

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Login successful.",
                "data": {
                    "accessToken": access_token,
                    "refreshToken": refresh_token,
                    **user_data
                }
            })

        except serializers.ValidationError as ve:
            error_msg = ""
            if "non_field_errors" in ve.detail:
                error_msg = ve.detail["non_field_errors"][0]
            else:
                error_msg = str(ve.detail)
            return Response({
                "status": False,
                "statusCode": 200,
                "message": f"Validation failed ; {error_msg}",
            }, status=200)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error during login.",
                "error": str(exc)
            })



class GetProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user

            user_data = {
                "id": user.id,
                "email": user.email,
                "userName": user.userName,
                "phone": user.phone,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "gender": user.gender,
                "language": user.language,
                "profileImage": request.build_absolute_uri(user.profileImage.url) if user.profileImage else None,
                "role": user.role.id if user.role else None,
                "roleName": user.role.role_name if user.role else None,
                "isActive": user.isActive,
                "isDeleted": user.isDeleted,
                "lastLogin": user.lastLogin,
                "appleID": user.appleID,
                "stripeOrderCustomerId": user.stripeOrderCustomerId,
                "loginType": user.loginType,
                "createdAt": user.createdAt,
                "updatedAt": user.updatedAt,
            }

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Profile fetched successfully.",
                "data": user_data
            }, status=200)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Unable to fetch profile.",
                "error": str(exc)
            }, status=500)



# class UpdateProfileAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def put(self, request):
#         try:
#             user = request.user

#             allowed_fields = [
#                 "firstName", "lastName", "phone",
#                 "gender", "language", "userName"
#             ]

#             for field in allowed_fields:
#                 if field in request.data:
#                     setattr(user, field, request.data[field])

#             # NEW — Update userType (as you requested)
#             if "userType" in request.data:
#                 user.userType = request.data["userType"]
                
#             # EMAIL VERIFICATION FLAG (FRONTEND CONTROLLED)
#             if request.data.get("is_verify") is True:
#                 user.is_verify = True    

#             # Handle profile image
#             if "profileImage" in request.FILES:
#                 user.profileImage = request.FILES["profileImage"]

#             user.save()

#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Profile updated successfully."
#             }, status=200)

#         except IntegrityError:
#             return Response({
#                 "status": False,
#                 "statusCode": 400,
#                 "message": "Username already exists.",
#             }, status=400)

#         except Exception as exc:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": "Unable to update profile.",
#                 "error": str(exc)
#             }, status=500)


class UpdateProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        try:
            user = request.user

            allowed_fields = [
                "firstName", "lastName", "phone",
                "gender", "language", "userName"
            ]

            for field in allowed_fields:
                if field in request.data:
                    setattr(user, field, request.data[field])

            # NEW — Update userType (as you requested)
            if "userType" in request.data:
                user.userType = request.data["userType"]
                
            # EMAIL VERIFICATION FLAG (FRONTEND CONTROLLED)
            if request.data.get("is_verify") is True:
                user.is_verify = True    

            # Handle profile image
            if "profileImage" in request.FILES:
                user.profileImage = request.FILES["profileImage"]

            user.save()

            # ✅ SERIALIZE COMPLETE UPDATED USER DATA
            response_data = UserResponseSerializer(
                user,
                context={"request": request}
            ).data

            # ✅ Ensure full profileImage URL
            if user.profileImage:
                response_data["profileImage"] = request.build_absolute_uri(
                    user.profileImage.url
                )

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Profile updated successfully.",
                "data": response_data
            }, status=200)

        except IntegrityError:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Username already exists.",
            }, status=400)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Unable to update profile.",
                "error": str(exc)
            }, status=500)




class DeleteProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        try:
            user = request.user
            user.delete()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Profile deleted permanently."
            }, status=200)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Unable to delete profile.",
                "error": str(exc)
            }, status=500)



class ForgotPasswordAPIView(APIView):

    def post(self, request):
        try:
            email = request.data.get("email")

            if not email:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Validation failed.",
                    "error": {"email": "Email is required."}
                }, status=400)

            # Check user exists
            try:
                user = Users.objects.get(email=email, isDeleted=False)
            except Users.DoesNotExist:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "No account found with this email."
                }, status=404)

            # Create reset token
            # reset_token = uuid.uuid4().hex
            # user.resetToken = reset_token
            # user.save()
            user_id = user.id

            # Build reset link
            frontend_url = "http://localhost:3000/auth/reset-password"
            reset_link = f"{frontend_url}?user_id={user_id}"

            # -------------------------------
            # ✅ SMTP: Send Reset Email Here
            # -------------------------------
            subject = "Reset Your Password"
            message = f"Hello,\n\nClick the link below to reset your password:\n{reset_link}\n\nIf you did not request this, please ignore this email."
            from_email = settings.EMAIL_HOST_USER
            recipient_list = [email]

            send_mail(subject, message, from_email, recipient_list, fail_silently=False)

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Reset link sent successfully.",
                "resetLink": reset_link
            }, status=200)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Unable to process forgot password.",
                "error": str(exc)
            }, status=500)



class ResetPasswordAPIView(APIView):

    def post(self, request):
        try:
            user_id = request.data.get("userId")
            new_password = request.data.get("newPassword")
            confirm_password = request.data.get("confirmPassword")

            # Required fields validation
            if not user_id or not new_password or not confirm_password:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Validation failed.",
                    "error": {
                        "userId": "Required." if not user_id else "",
                        "newPassword": "Required." if not new_password else "",
                        "confirmPassword": "Required." if not confirm_password else ""
                    }
                }, status=400)

            # Check new & confirm password match
            if new_password != confirm_password:
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "New password and confirm password do not match."
                }, status=200)

            # Find user by userId
            try:
                user = Users.objects.get(id=user_id, isDeleted=False)
            except Users.DoesNotExist:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "Invalid user."
                }, status=404)

            # Update password
            user.password = make_password(new_password)
            # user.resetToken = None  # Optional: clear token
            user.save()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Password reset successfully."
            })

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Unable to reset password.",
                "error": str(exc)
            }, status=500)


class UpdatePasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def validate_password(self, password):
        """
        Validates password:
        - At least 8 characters
        - Must contain a number
        - Must contain a special character
        """
        if len(password) < 8:
            return "Password must be at least 8 characters long."

        if not re.search(r"\d", password):
            return "Password must contain at least one number."

        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
            return "Password must contain at least one special character."

        return None

    def post(self, request):
        try:
            user = request.user

            current_password = request.data.get("currentPassword")
            new_password = request.data.get("newPassword")
            confirm_password = request.data.get("confirmPassword")

            # Required fields validation
            if not current_password or not new_password or not confirm_password:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Validation failed.",
                    "error": {
                        "currentPassword": "Required." if not current_password else "",
                        "newPassword": "Required." if not new_password else "",
                        "confirmPassword": "Required." if not confirm_password else ""
                    }
                }, status=400)

            # Check current password
            if not check_password(current_password, user.password):
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Current password is incorrect."
                }, status=400)

            # Check if new & confirm password match
            if new_password != confirm_password:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "New Password and Confirm Passwords do not match.",
                }, status=400)

            # Apply password policy validation
            password_error = self.validate_password(new_password)
            if password_error:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": password_error
                }, status=400)

            # Prevent same password reuse
            if check_password(new_password, user.password):
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "New password cannot be same as current password."
                }, status=400)

            # Save new password
            user.password = make_password(new_password)
            user.save()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Password updated successfully."
            }, status=200)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Unable to update password.",
                "error": str(exc)
            }, status=500)


class VerifyUserAPIView(APIView):
    def post(self, request):
        serializer = VerifyUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_id = serializer.validated_data["user_id"]
        # is_verify is already validated as True by serializer

        try:
            user = Users.objects.get(id=user_id, isDeleted=False)
        except Users.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "User not found."
            }, status=404)

        #  Already verified case (idempotent API)
        if user.is_verify:
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "User already verified."
            }, status=200)

        #  Verify user
        user.is_verify = True
        user.save(update_fields=["is_verify"])

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "User verified successfully."
        }, status=200)



#-----------------Notification-------------------------



# class NotificationCreateAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         try:
#             serializer = NotificationSerializer(data=request.data)
#             if serializer.is_valid():
#                 serializer.save(user=request.user)
#                 return Response({
#                     "status": True,
#                     "statusCode": 200,
#                     "message": "Notification created successfully",
#                     "data": serializer.data
#                 }, status=status.HTTP_200_OK)

#             return Response({
#                 "status": False,
#                 "statusCode": 400,
#                 "message": serializer.errors,
#                 "data": None
#             }, status=status.HTTP_400_BAD_REQUEST)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": str(e),
#                 "data": None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# class NotificationListAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         try:
#             notifications = Notifications.objects.filter(
#                 user=request.user,
#                 isDeleted=False
#             ).order_by("-created_at")

#             serializer = NotificationSerializer(notifications, many=True)

#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Notifications fetched successfully",
#                 "data": serializer.data
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": str(e),
#                 "data": None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class NotificationDetailAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, pk):
#         try:
#             notification = get_object_or_404(
#                 Notifications,
#                 pk=pk,
#                 user=request.user,
#                 isDeleted=False
#             )

#             serializer = NotificationSerializer(notification)

#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Notification details fetched successfully",
#                 "data": serializer.data
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 404,
#                 "message": str(e),
#                 "data": None
#             }, status=status.HTTP_404_NOT_FOUND)


# class NotificationUpdateAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def put(self, request, pk):
#         try:
#             notification = get_object_or_404(
#                 Notifications,
#                 pk=pk,
#                 user=request.user,
#                 isDeleted=False
#             )

#             serializer = NotificationSerializer(
#                 notification,
#                 data=request.data,
#                 partial=True
#             )

#             if serializer.is_valid():
#                 serializer.save()
#                 return Response({
#                     "status": True,
#                     "statusCode": 200,
#                     "message": "Notification updated successfully",
#                     "data": serializer.data
#                 }, status=status.HTTP_200_OK)

#             return Response({
#                 "status": False,
#                 "statusCode": 400,
#                 "message": serializer.errors,
#                 "data": None
#             }, status=status.HTTP_400_BAD_REQUEST)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": str(e),
#                 "data": None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class NotificationDeleteAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def delete(self, request, pk):
#         try:
#             notification = get_object_or_404(
#                 Notifications,
#                 pk=pk,
#                 user=request.user,
#                 isDeleted=False
#             )

#             notification.isDeleted = True
#             notification.isActive = False
#             notification.save()

#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Notification deleted successfully",
#                 "data": None
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": str(e),
#                 "data": None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#<---------------------ModelsInfo------------------->
class ModelInfoCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request):
        try:
            serializer = ModelInfoSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            model_info = serializer.save()
            return Response({
                'statusCode' : 201,
                'status':True,
                "message": "3D model information created successfully",
                "data": ModelInfoSerializer(model_info).data
            },status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'statusCode':500,
                'status':False,
                "message": "Something went wrong on server",
                "details": str(e)
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
class ModelInfoListAPIView(APIView):
    parser_classes = [IsAuthenticated]
    def get(self,request):
        model_Info = ModelInfo.objects.filter(isDeleted=False).order_by('-created_at') 
        ids = request.GET.get("ids")
        if ids:
            try:
                id_list = [int(i.strip()) for i in ids.split(",")]
                model_Info = model_Info.filter(id_in = id_list)
            except ValueError:
                return Response({
                    'status':False,
                    'message':'Invalid ID format',
                },status=status.HTTP_400_BAD_REQUEST)
            
        serializer = ModelInfoSerializer(model_Info,many=True, context={'request': request})
        return Response({
            'statusCode':200,
            'status':True,
            'message': 'Model info fetched successfully',
            'data':serializer.data

        },status=status.HTTP_200_OK)

class ModelInfoDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request,id):
        model_info = get_object_or_404(
            ModelInfo,
            id=id,
            isDeleted=False
        )
        serializer = ModelInfoSerializer(model_info,context={'request': request})
        return Response({
            'statusCode':200,
            'status':True,
            'message':'Model info fetched successfully',
            'data':serializer.data
        },status=status.HTTP_200_OK)
    
class ModelInfoUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self,request,id):
        model_info = get_object_or_404(
            ModelInfo,
            id=id,
            isDeleted=False
        )
        
        serializer = ModelInfoSerializer(
            model_info,
            data=request.data,
            partial = True
        )

        if serializer.is_valid():
            serializer.save()
            return Response({
                'statusCode':200,
                'status':True,
                "message": "Model info updated successfully",
                "data": serializer.data
            },status=status.HTTP_200_OK)
        
        return Response({
            'statusCode':400,
            'status':False,
            'message':"Invalid data",
            "errors": serializer.errors
        },status=status.HTTP_400_BAD_REQUEST)

class ModelInfoDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self,request,id=None):
        ids = request.data.get('id',None)
        
        #single delete
        if id:
            try:
                obj = ModelInfo.objects.get(id=id)
                obj.delete()
                return Response({
                    'statusCode':204,
                    'status':True,
                    'message':'ModelInfo permanently deleted.',
                    'data':None
                },status=status.HTTP_204_NO_CONTENT)
            
            except ModelInfo.DoesNotExist:
                return Response({
                    'statusCode':404,
                    'status':False,
                    'message':'ModelInfo not found.',
                    'data':None
                },status=status.HTTP_404_NOT_FOUND)
        

        # Delete all
        if ids == "all":
            queryset = ModelInfo.objects.all()
            count = queryset.count()
            queryset.delete()
            return Response({
                "statusCode": 200,
                "status": True,
                "message": f"All {count} ModelInfo permanently deleted.",
                "data": None
            }, status=status.HTTP_200_OK)
  # Bulk delete
        if not ids or not isinstance(ids, list):
            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Please provide a list of IDs in 'id' field or 'all'.",
                "data": None
            }, status=status.HTTP_400_BAD_REQUEST)

        queryset = ModelInfo.objects.filter(id__in=ids)
        count = queryset.count()
        queryset.delete()

        return Response({
            "statusCode": 200,
            "status": True,
            "message": f"{count} ModelInfo permanently deleted.",
            "data": None
        }, status=status.HTTP_200_OK)
    
#<-------------------------CustomUpdateModel--------------------->
class CustomUpdateModelCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request):
        try:
            serializer = CustomUpdateModelSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response({
                "statusCode":201,
                "status":True,
                "message":"Custom Update create successfully. ",
                "data":serializer.data
            },status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                "statusCode":500,
                "status":False,
                "message":"Something went wrong on server",
                "error":str(e)
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class CustomUpdateModelListAPIView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        custom = CustomUpdateModel.objects.filter(isDeleted=False).order_by('-created_at') 

        ids = request.GET.get("ids")

        if ids:
            try:
                id_list = [int(i.strip()) for i in ids.split(",")]
                custom = custom.filter(id__in=id_list)
            except ValueError:
                return Response({
                    "statusCode":400,
                    "status":False,
                    "message":"Invalid ID format. ",
                },status=status.HTTP_400_BAD_REQUEST)

        serializer = CustomUpdateModelSerializer(custom,many=True)
        return Response({
                'statusCode':200,
                'status':True,
                'message': 'Custom Model info fetched successfully',
                'data':serializer.data
            },status=status.HTTP_200_OK)

class CustomUpdateModelDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request,id):
        custom = get_object_or_404(
            CustomUpdateModel,
            id=id,
            isDeleted=False
        )
        serializer = CustomUpdateModelSerializer(custom)
        return Response({
            'statusCode':200,
            'status':True,
            'message':'Custom Model info fetched successfully',
            'data':serializer.data
        },status=status.HTTP_200_OK)

class CustomUpdateModelUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self,request,id):
        custom = get_object_or_404(
            CustomUpdateModel,
            id=id,
            isDeleted=False
        )
        serializer = CustomUpdateModelSerializer(
            custom,
            data=request.data,
            partial = True
        )

        if serializer.is_valid():
            serializer.save()
            return Response({
                "statusCode":200,
                "status":True,
                "message":"Custom Model Update Successfully. ",
                "data":serializer.data
            },status=status.HTTP_200_OK)
    
        return Response({
            "statusCode":400,
            "status":False,
            "message":"Invalid data",
            "errors": serializer.errors
        },status=status.HTTP_400_BAD_REQUEST)
            
class CustomUpdateModelDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self,request,id=None):
        ids = request.data.get('id',None)
        
        #single delete
        if id:
            try:
                obj = CustomUpdateModel.objects.get(id=id)
                obj.delete()
                return Response({
                    'statusCode':204,
                    'status':True,
                    'message':'Custom Model permanently deleted.',
                    'data':None
                },status=status.HTTP_204_NO_CONTENT)
            
            except CustomUpdateModel.DoesNotExist:
                return Response({
                    'statusCode':404,
                    'status':False,
                    'message':'Custom Model not found.',
                    'data':None
                },status=status.HTTP_404_NOT_FOUND)
            
            
        # Delete all
        if ids == "all":
            queryset = CustomUpdateModel.objects.all()
            count = queryset.count()
            queryset.delete()
            return Response({
                "statusCode": 200,
                "status": True,
                "message": f"All {count} Custom Model permanently deleted.",
                "data": None
            }, status=status.HTTP_200_OK)
        
        # Bulk delete
        if not ids or not isinstance(ids, list):
            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Please provide a list of IDs in 'id' field or 'all'.",
                "data": None
            }, status=status.HTTP_400_BAD_REQUEST)

        queryset = CustomUpdateModel.objects.filter(id__in=ids)
        count = queryset.count()
        queryset.delete()

        return Response({
            "statusCode": 200,
            "status": True,
            "message": f"{count} Custom Model permanently deleted.",
            "data": None
        }, status=status.HTTP_200_OK)
