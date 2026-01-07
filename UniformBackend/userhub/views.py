from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from uniformAdmin.models import AdminUser
from django.utils.timezone import now
from rest_framework.permissions import IsAuthenticated ,IsAdminUser
from .utils import *
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
from django.db import IntegrityError, transaction
from decimal import Decimal
from django.db.models import Count
from django.utils.dateparse import parse_date
from .payment import CustomPagination
from uniformAdmin.signal import *
from uniformAdmin.models import *
from rest_framework.permissions import AllowAny
from django.utils.http import urlsafe_base64_decode
from uniformAdmin.signal import *

import re
logger = logging.getLogger(__name__)



class SignupAPIView(APIView):
    permission_classes=[AllowAny]
    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        data["userType"] = data.get("userType")

        serializer = UserSignupSerializer(data=data)

        # request.data._mutable = True
        # request.data["userType"] = request.data.get("userType")
        # serializer = UserSignupSerializer(data=request.data)

        try:
            if serializer.is_valid():
                user = serializer.save()
                
                 # EMAIL VERIFICATION 
                uid = urlsafe_base64_encode(force_bytes(user.id))                
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

                errors = serializer.errors
                missing_fields = []

                if isinstance(errors, dict):
                    for field, messages in errors.items():
                        if isinstance(messages, list) and messages:
                            # collect fields with "required" error
                            if "required" in messages[0].lower():
                                missing_fields.append(field)

                if missing_fields:
                    fields_str = ", ".join(missing_fields)
                    error_message = f"Validation failed; {fields_str} : This field is required."
                else:
                    error_message = "Validation failed."
                                            
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": error_message
                }, status=status.HTTP_200_OK)

        except Exception as exc:
            logger.exception("Signup error")
            return Response({
                "status": False,
                "statusCode": 500,
                    "message": "Server error while creating user.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class LoginAPIView(APIView):
    permission_classes = [AllowAny]
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
                }, status=200)
            # ----------------------------------------

            serializer = LoginSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data["user"]


           ##
            #  EMAIL VERIFICATION CHECK 
           ##
            if not user.is_verify:
                return Response({
                    "status": False,
                    "statusCode": 403,
                    "message": "Please verify your email before logging in."
                }, status=200)
           ##
            

            # Check matching userType
            if user.userType != user_type:
                return Response({
                    "status": False,
                    "statusCode": 403,
                    "message": "You are not allowed to login in this section."
                }, status=200)

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
                "statusCode": 400,
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
            user_type = request.data.get("userType")  

            if not email and not user_type:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Validation failed.",
                    "error": {"email": "Email and user_type are required."}
                }, status=400)

            # Check user exists
            try:
                user = Users.objects.get(email=email, isDeleted=False, userType=user_type)
            except Users.DoesNotExist:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "No account found with this email and user type."
                }, status=400)

            # Create reset token
            # reset_token = uuid.uuid4().hex
            # user.resetToken = reset_token
            # user.save()
            user_id = user.id

            # Build reset link
            frontend_url = "http://localhost:7000/auth/reset-password"
            reset_link = f"{frontend_url}?user_id={user_id}"

            # -------------------------------
            # SMTP: Send Reset Email Here
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
                    "statusCode": 400,
                    "message": "New password and confirm password do not match."
                }, status=200)

            # Find user by userId
            try:
                user = Users.objects.get(id=user_id, isDeleted=False)
            except Users.DoesNotExist:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Invalid user."
                }, status=400)

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

# ADD TO CART 

class AddToCartAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            product_id = request.data.get("product_id")
            quantity = int(request.data.get("quantity", 1))
            product = Product.objects.get(id=product_id)
        
            cart, _ = Cart.objects.get_or_create(
                user=request.user,
                is_active=True
            )

            item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product
            )

            if not created:
                # If item already exists, increase quantity
                item.quantity += quantity
                item.save()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Item already in cart. Quantity updated.",
                    "cart_item": {
                        "id": item.id,
                        "product": item.product.productName,
                        "quantity": item.quantity,
                        "price": float(item.price)* quantity
                    }
                }, status=status.HTTP_200_OK)
            else:
                 return Response({
                    "status": True,
                    "statusCode": 201,
                    "message": "Item added to cart successfully.",
                    "cart_item": {
                        "id": item.id,
                        "product": item.product.productName,
                        "quantity": item.quantity,
                        "price": float(item.price)
                    }
                }, status=status.HTTP_201_CREATED)

        except Product.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                "error": "Product not found"
            }, status=status.HTTP_404_NOT_FOUND)



# CART LISTING
class CartListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            cart = Cart.objects.get(user=request.user, is_active=True)
            cart_items = CartItem.objects.filter(cart=cart).order_by('id')
            paginator = CustomPagination()
            paginated_items = paginator.paginate_queryset(cart_items, request)
            serializer = CartItemSerializer(paginated_items, many=True)
            return paginator.get_paginated_response(serializer.data)

        except Cart.DoesNotExist:
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Cart is empty",
                "data": [],
                "pagination": {
                    "currentPage": 1,
                    "limit": 0,
                    "totalItems": 0,
                    "totalPages": 0,
                    "nextPage": False,
                    "previousPage": False
                }
            }, status=status.HTTP_200_OK)

# UPDATE
class UpdateCartItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        try:
            item_id = request.data.get("item_id")
            quantity = int(request.data.get("quantity"))

            item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user
            )
            if quantity <= 0:
                item.delete()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Item removed from cart"
                }, status=status.HTTP_200_OK)

            item.quantity = quantity
            item.save()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Cart item quantity updated successfully"
            }, status=status.HTTP_200_OK)

        except CartItem.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                "error": "Cart item not found"
            }, status=status.HTTP_404_NOT_FOUND)



# Delete
class RemoveCartItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        try:
            item_id = request.data.get("item_id")
            if not item_id:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "error": "Item ID is required "
                }, status=status.HTTP_400_BAD_REQUEST)

            item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user
            )
            item.delete()
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Item removed from cart successfully"
            }, status=status.HTTP_200_OK)

        except CartItem.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                "error": "Item not found"
            }, status=status.HTTP_404_NOT_FOUND)



class ItemSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            cart = Cart.objects.get(user=request.user, is_active=True)
            cart_items = CartItem.objects.filter(cart=cart)

            if not cart_items.exists():
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "error": "Cart is empty"
                }, status=status.HTTP_400_BAD_REQUEST)

            items_count = sum(item.quantity for item in cart_items)
            subtotal = sum(item.total_price for item in cart_items)
            shipping = Decimal("0.00")
            tax = Decimal("0.00")
            fees = Decimal("0.00")
            discount = Decimal("0.00")

            total_amount = subtotal + shipping + tax + fees - discount

            items_list = []
            for item in cart_items:
                items_list.append({
                    "name": item.product.productName,
                    "quantity": item.quantity,
                    "price": item.price,
                    "total": item.total_price
                })

            return Response({
                "items_count": items_count,
                "items": items_list,
                "subtotal": subtotal,
                "shipping": None,
                "tax": None,
                "fees": None,
                "discount": None,
                "total_amount": total_amount
            })

        except Cart.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 400,
                "error": "Cart is empty"
            }, status=status.HTTP_400_BAD_REQUEST)


class CreateOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        user = request.user

        customer_data = data.get("customer", {})
        address_data = data.get("delivery_address", {})
        payment_data = data.get("payment", {})
        cart_id = data.get("cart_id")

        if not cart_id:
            return Response({"error": "cart_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cart = Cart.objects.get(id=cart_id, user=user, is_active=True)
        except Cart.DoesNotExist:
            return Response({"error": "Cart not found."}, status=status.HTTP_400_BAD_REQUEST)

        customer, _ = CustomerDetails.objects.update_or_create(
            user=user,
            defaults={
                "first_name": customer_data.get("first_name"),
                "last_name": customer_data.get("last_name"),
                "email": customer_data.get("email"),
                "phone": customer_data.get("phone"),
                "address_line_1": address_data.get("address_line_1"),
                "address_line_2": address_data.get("address_line_2"),
                "city": address_data.get("city"),
                "postal_code": address_data.get("postal_code"),
                "country": address_data.get("country"),
                "payment_method": payment_data.get("payment_method"),
            }
        )

        cart_items = cart.items.all()
        if not cart_items.exists():
            return Response({"error": "No items found in this cart."}, status=status.HTTP_400_BAD_REQUEST)

        # Cart total
        total_amount = sum((item.total_price for item in cart_items), Decimal("0.00"))
        discount_amount = Decimal("0.00")

        # Rental dates
        rental_data = data.get("rental", {})
        start_date = parse_date(rental_data.get("start_date"))
        return_date = parse_date(rental_data.get("return_date"))

        if not start_date or not return_date or return_date < start_date:
            return Response({"error": "Invalid rental dates."}, status=status.HTTP_400_BAD_REQUEST)

        # ================= PROMOCODE =================
        promocode_data = data.get("promocode")
        promocode = None
        original_amount = total_amount
        now = timezone.now()

        if promocode_data and promocode_data.get("code"):
            code = promocode_data.get("code")
            try:
                promocode = Promocode.objects.get(
                    promocodeName=code,
                    isActive=True,
                    isDeleted=False
                )
            except Promocode.DoesNotExist:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "error": "Promocode not found or invalid."
                }, status=400)

            # Date validation
            if promocode.started_at and promocode.started_at > now:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "error": "Promocode not active yet."
                }, status=400)

            if promocode.ended_at and promocode.ended_at < now:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "error": "Promocode expired."
                }, status=400)

            # User already used
            if Order.objects.filter(user=user, promocode=promocode).exists():
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "error": "You have already used this promocode."
                }, status=400)

            # Calculate discount
            if promocode.promocodeType == "fix_price" and promocode.amount:
                discount_amount = Decimal(promocode.amount)
            elif promocode.promocodeType == "discount" and promocode.amount:
                discount_amount = original_amount * (Decimal(promocode.amount) / 100)

            total_amount = original_amount - discount_amount

        # Ensure total_amount is not negative
        if total_amount < 0:
            total_amount = Decimal("0.00")

        # Create order
        order = Order.objects.create(
            user=user,
            cart=cart,
            customer=customer,
            Payment_method=payment_data.get("payment_method"),
            total_amount=total_amount,
            status="created",   
            order_type="uniform",
            promocode=promocode
        )

        order.start_date = start_date
        order.return_date = return_date
        order.save()
        # order = order.save() 
# Call the helper function instead of writing objects.create directly
        create_admin_order_notification(
                instance=order,
                title=f"New Order created: {order.order_id }",
                message=f"A new Order request has been created by {order.user}.",
                priority="high",
                object_id=order.order_id 
            )

        # Prepare response
        response_data = {
            "cart": {
                "cart_id": cart.id,
                "items": [{"id": item.id, "total_price": float(item.total_price)} for item in cart_items]
            },
            "customer": {
                "first_name": customer.first_name,
                "last_name": customer.last_name,
                "email": customer.email,
                "phone": customer.phone
            },
            "delivery_address": {
                "address_line_1": customer.address_line_1,
                "address_line_2": customer.address_line_2,
                "city": customer.city,
                "postal_code": customer.postal_code,
                "country": customer.country
            },
            "rental": {
                "start_date": start_date.strftime("%Y-%m-%d"),
                "return_date": return_date.strftime("%Y-%m-%d"),
                "duration_days": (return_date - start_date).days + 1
            },
            "payment": {
                "payment_method": customer.payment_method
            },
            "promocode": {
                "code": promocode.promocodeName if promocode else None
            },
            "order": {
                "order_id": str(order.order_id),
                "total_amount": float(total_amount),
                "discount": float(discount_amount),
                "order_status": order.status
            }
        }

        return Response({
            "status": True,
            "statusCode": 201,
            "message": "Order created successfully",
            "data": response_data
        })


class OrderSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")
        if not order_id:
            return Response(
                {"error": "Order ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order = Order.objects.get(order_id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        customer = order.customer
        cart_items = order.cart.items.all()  # all items in this order's cart

        order_items_list = []
        for item in cart_items:
            order_items_list.append({
                "name": item.product.productName,
                "quantity": item.quantity,
                "price_per_item": float(item.price),
                "total_price": float(item.total_price),
                "thumbnail": item.product.ProductImage.url if item.product.ProductImage else None
            })

        duration_days = (order.return_date - order.start_date).days + 1


        subtotal = float(sum(item.total_price for item in cart_items))
        total_amount = float(order.total_amount)
        discount = float(subtotal - total_amount) if subtotal > total_amount else 0.0

        response_data = {
            "contact_information": {
                "name": f"{customer.first_name} {customer.last_name}",
                "email": customer.email,
                "phone": customer.phone
            },
            "delivery_address": {
                "address": f"{customer.address_line_1}, "
                           f"{customer.address_line_2}, "
                           f"{customer.city}, "
                           f"{customer.postal_code}, "
                           f"{customer.country}"
            },
            "rental_period": {
                "start": order.start_date.strftime("%Y-%m-%d"),
                "return": order.return_date.strftime("%Y-%m-%d"),
                "duration": f"{duration_days} days"
            },
            "order_items": order_items_list,
            "payment": {
                "payment_method": order.Payment_method 
            },
            "promocode": {
                "code": order.promocode.promocodeName if order.promocode else None
            },
            "order_summary": {
                "subtotal": subtotal,
                "discount": discount,
                "total": total_amount
            }
        }

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Order review fetched successfully",
            "data": response_data
        })


class OrderListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')

        if not orders.exists():
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "No orders found",
                "data": [],
                "pagination": {
                    "currentPage": 1,
                    "limit": 0,
                    "totalItems": 0,
                    "totalPages": 0,
                    "nextPage": False,
                    "previousPage": False
                }
            }, status=status.HTTP_200_OK)

        paginator = CustomPagination()
        paginated_orders = paginator.paginate_queryset(orders, request)
        serializer = OrderSerializer(paginated_orders, many=True)
        return paginator.get_paginated_response(serializer.data)



class OrderDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")

        if not order_id:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "order_id is required",
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.get(
                order_id=order_id,
                user=request.user
            )

            serializer = OrderSerializer(order)
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Order fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Order.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "Order not found",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

