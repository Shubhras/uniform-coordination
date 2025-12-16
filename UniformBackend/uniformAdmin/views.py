from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from uniformAdmin.serializers import *
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from rest_framework_simplejwt.authentication import JWTAuthentication
from datetime import timedelta
from django.shortcuts import get_object_or_404
from django.contrib.auth.tokens import default_token_generator
from uniformAdmin.fabric import CustomPagination
from rest_framework.parsers import MultiPartParser, FormParser



class AdminLoginAPIView(APIView):
    def post(self, request):
        try:
            serializer = AdminLoginSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']

            remember_me = request.data.get('remember_me', False)
            if isinstance(remember_me, str):
                remember_me = remember_me.lower() == 'true'


            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            refresh["user_id"] = str(user.id)
            refresh["role"] = "admin"
            # refresh["email"] = user.email

            if remember_me:
                refresh.set_exp(lifetime=timedelta(days=30))             
                refresh.access_token.set_exp(lifetime=timedelta(days=30))
            else:
                refresh.set_exp(lifetime=timedelta(days=1))               
                refresh.access_token.set_exp(lifetime=timedelta(hours=1))


            refresh_token = str(refresh)
            access_token = str(refresh.access_token)

            response_data = {
                "status": True,
                "statusCode": 200,
                "message": "Login successful",
                "data": {
                    "admin": {
                        "id": user.id,
                        "email": user.email,
                        "role": user.role.role_name if user.role else None,
                        "name": user.name,
                        "remember_me": remember_me,
                    },
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                
                }
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except ValidationError as ve:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Validation Error",
                "errors": ve.detail
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Something went wrong",
                "errors": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminChangePasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]  

    def post(self, request):
        try:
            serializer = AdminChangePasswordSerializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            user = request.user

            # Set new password
            with transaction.atomic():
                user.set_password(serializer.validated_data['new_password'])
                user.save()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Password changed successfully"
            }, status=status.HTTP_200_OK)

        except ValidationError as ve:
            # **Return 400 for validation errors**
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Validation Error",
                "errors": ve.detail
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # **Only unexpected errors return 500**
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Something went wrong",
                "errors": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminUpdateProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        try:
            user = request.user  
            serializer = AdminUpdateSerializer(user, data=request.data, partial=True)
            
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    'message': 'Profile updated successfully',
                    'data': serializer.data
                }, status=status.HTTP_200_OK)

        except ValidationError as ve:
            return Response({
                "status": False,
                "statusCode": 400,
                'message': 'Validation error',
                'errors': ve.message_dict
            }, status=status.HTTP_200_OK)

        except ObjectDoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                'error': 'User not found'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                'error': 'Something went wrong',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)        


class AdminDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user

            jwt_auth = JWTAuthentication()

            header = jwt_auth.get_header(request)
            raw_token = jwt_auth.get_raw_token(header)
            validated_token = jwt_auth.get_validated_token(raw_token)

            role = validated_token.get('role')

            if role != 'admin':
                return Response({
                    "status": False,
                    "statusCode": 403,
                    "error": "Forbidden",
                    "details": "Only admin users can access this endpoint"
                }, status=status.HTTP_200_OK)

            serializer = AdminDetailSerializer(user)
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Admin details retrieved successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except AttributeError:
            return Response({
                "status": False,
                "statusCode": 404,
                "error": "User not found",
                "details": "The authenticated user does not exist"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "error": "Something went wrong",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminLogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if not refresh_token:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "error": "Bad Request",
                    "details": "Refresh token is required for logout"
                }, status=status.HTTP_200_OK)

            try:
                token = RefreshToken(refresh_token)
                token.blacklist()  
            except TokenError:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "error": "Invalid token",
                    "details": "Token is already blacklisted or malformed"
                }, status=status.HTTP_200_OK)

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Logout successful"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "error": "Something went wrong",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminForgotPasswordAPIView(APIView):
    # authentication_classes = [JWTAuthentication] 
    # permission_classes = [IsAuthenticated]  

    def post(self, request):
        """Send password reset email to admin and return reset link in response"""
        ip = request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT', 'unknown')

        try:
            email = request.data.get("email")
            if not email:
                return Response(
                    {"statusCode": 400, "status": False, "message": "Email is required"},
                    status=status.HTTP_200_OK
                )
            try:
                user = AdminUser.objects.get(email=email, is_staff=True)  
            except AdminUser.DoesNotExist:
                return Response(
                    {"statusCode": 404, "status": False, "message": "Admin not found"},
                    status=status.HTTP_200_OK
                )

            token = default_token_generator.make_token(user)
            base_url = "http://23.23.88.239:7001/forgotpassword/"
            full_reset_link = f"{base_url}?token={token}&user_id={user.pk}"


            # try:
            #     send_mail(
            #         subject="Admin Password Reset Request",
            #         message=f"Click the link to reset your password: {full_reset_link}",
            #         from_email="your-email@gmail.com",
            #         recipient_list=[email],
            #         fail_silently=False,
            #     )
            #     logger.info(f"[Forgot Password] Reset email sent to: {email} | IP: {ip}")
            # except Exception as e:
            #     logger.error(f"[Forgot Password] Failed to send reset email to {email}: {e} | IP: {ip}")
            #     return Response(
            #         {"statusCode": 500, "status": False, "message": "Failed to send email", "error": str(e)},
            #         status=status.HTTP_500_INTERNAL_SERVER_ERROR
            #     )

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Password reset email sent",
                "reset_link": full_reset_link
            }, status=status.HTTP_200_OK)           

        except Exception as e:
            # logger.exception(f"[Forgot Password] Unexpected error: {e} | IP: {ip}")
            return Response(
                {"statusCode": 500, "status": False, "message": "An unexpected error occurred", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


#---------------Blog APIs-------------------


class BlogCreateAPIView(APIView):
    """Admin: Create Blog"""
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        try:
            serializer = BlogSerializer(
                data=request.data,
                context={"request": request}
            )

            if serializer.is_valid():
                blog = serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 201,
                    "message": "Blog created successfully.",
                    "data": BlogSerializer(blog, context={"request": request}).data
                }, status=status.HTTP_201_CREATED)

            # 🔹 CUSTOM CATEGORY ERROR
            if "category" in serializer.errors:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Validation failed; Invalid Selected Category",
                }, status=status.HTTP_400_BAD_REQUEST)

            # 🔹 CUSTOM DUPLICATE TITLE ERROR
            if "title" in serializer.errors:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": f"Validation failed; {serializer.errors['title'][0]}"
                }, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Validation failed.",
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while creating blog.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BlogListAPIView(APIView):
    """List all blogs"""

    def get(self, request):
        try:
            search = request.query_params.get("search", "").strip()
            category_id = request.query_params.get("category")

            blogs = Blog.objects.filter(isDeleted=False)

    
            if search:
                blogs = blogs.filter(title__icontains=search)

        
            if category_id:
                blogs = blogs.filter(category_id=category_id)

            blogs = blogs.order_by("-created_at")

            
            paginator = CustomPagination()
            page = paginator.paginate_queryset(blogs, request)

            serializer = BlogSerializer(
                page,
                many=True,
                context={"request": request}
            )

            response = {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Blog list fetched successfully.",
                "data": serializer.data,
                "pagination": {
                    "page": paginator.page.number,
                    "page_size": paginator.get_page_size(request),
                    "total_pages": paginator.page.paginator.num_pages,
                    "total_items": paginator.page.paginator.count
                }
            }

            return Response(response, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while fetching blogs.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BlogDetailAPIView(APIView):
    """Public: Get single Blog details by ID"""

    def get(self, request, blog_id):
        try:
            blog = Blog.objects.filter(
                id=blog_id,
                isDeleted=False
            ).select_related("category").first()

            if not blog:
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Blog not found."
                }, status=status.HTTP_200_OK)

            serializer = BlogSerializer(blog,context={"request": request})

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Blog details fetched successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while fetching blog details.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BlogUpdateAPIView(APIView):
    """Admin: Update Blog by ID"""

    parser_classes = (MultiPartParser, FormParser)

    def put(self, request, blog_id):
        try:
            try:
                blog = Blog.objects.get(id=blog_id, isDeleted=False)
            except Blog.DoesNotExist:
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Blog not found."
                }, status=status.HTTP_200_OK)

            serializer = BlogSerializer(
                blog,
                data=request.data,
                context={"request": request},
                partial=True
            )

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Blog updated successfully.",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)

            # 🔹 CUSTOM TITLE DUPLICATE ERROR (ONLY CHANGE)
            if "title" in serializer.errors:
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Validation failed;blog with this title already exists"
                }, status=status.HTTP_200_OK)

            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Validation failed.",
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while updating blog.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BlogDeleteAPIView(APIView):
    """
    Admin: Delete Blog
    - Single delete → /blogs/delete/<id>/
    - Multiple delete → { "ids": [1,2,3] }
    """

    def delete(self, request, blog_id=None):
        try:
            # 🔹 SINGLE DELETE
            if blog_id:
                try:
                    blog = Blog.objects.get(id=blog_id, isDeleted=False)
                except Blog.DoesNotExist:
                    return Response({
                        "status": False,
                        "statusCode": 404,
                        "message": "Blog not found."
                    }, status=status.HTTP_404_NOT_FOUND)

                blog.isDeleted = True
                blog.save()

                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Blog deleted successfully."
                }, status=status.HTTP_200_OK)

            # 🔹 MULTIPLE DELETE
            blog_ids = request.data.get("ids")
            if not blog_ids or not isinstance(blog_ids, list):
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Blog IDs list is required."
                }, status=status.HTTP_400_BAD_REQUEST)

            blogs = Blog.objects.filter(id__in=blog_ids, isDeleted=False)
            if not blogs.exists():
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "No blogs found to delete."
                }, status=status.HTTP_404_NOT_FOUND)

            blogs.update(isDeleted=True)

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Blogs deleted successfully."
            }, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while deleting blog(s).",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#---------------------------Categories--------------------------

class CategoryCreateAPIView(APIView):
    def post(self, request):
        try:
            serializer = CategorySerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Category created successfully.",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)

            if "categoryName" in serializer.errors:
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Validation failed; Category with this categoryName already exists."
                }, status=status.HTTP_200_OK)

            return Response({
                "status": False,
                "statusCode": 200,
                "message": "Validation failed.",
                "error": serializer.errors
            }, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while creating category.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CategoryListAPIView(APIView):
    def get(self, request):
        try:
            search = request.query_params.get("search", "").strip()

            categories = Category.objects.filter(isDeleted=False)

            # Search only on categoryName (as per requirement)
            if search:
                categories = categories.filter(categoryName__icontains=search)

            categories = categories.order_by("-created_at")

            # Apply pagination (same as reference API)
            paginator = CustomPagination()
            page = paginator.paginate_queryset(categories, request)
            serializer = CategorySerializer(page, many=True)

            response = {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Category list fetched successfully.",
                "data": serializer.data,
                "pagination": {
                    "page": paginator.page.number,
                    "page_size": paginator.get_page_size(request),
                    "total_pages": paginator.page.paginator.num_pages,
                    "total_items": paginator.page.paginator.count
                }
            }

            return Response(response, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while fetching categories.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CategoryDetailAPIView(APIView):
    def get(self, request, category_id):
        try:
            category = Category.objects.filter(
                id=category_id,
                isDeleted=False
            ).first()

            if not category:
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Category not found."
                }, status=status.HTTP_200_OK)

            serializer = CategorySerializer(category)

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Category details fetched successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while fetching category.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CategoryUpdateAPIView(APIView):
    def put(self, request, category_id):
        try:
            try:
                category = Category.objects.get(
                    id=category_id,
                    isDeleted=False
                )
            except Category.DoesNotExist:
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Category not found."
                }, status=status.HTTP_200_OK)

            serializer = CategorySerializer(
                category,
                data=request.data,
                partial=True
            )

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Category updated successfully.",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)

            if "categoryName" in serializer.errors:
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Validation failed; Category with this categoryName already exists."
                }, status=status.HTTP_200_OK)

            return Response({
                "status": False,
                "statusCode": 200,
                "message": "Validation failed.",
                "error": serializer.errors
            }, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while updating category.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CategoryDeleteAPIView(APIView):
    def delete(self, request, category_id):
        try:
            try:
                category = Category.objects.get(
                    id=category_id,
                    isDeleted=False
                )
            except Category.DoesNotExist:
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Category not found."
                }, status=status.HTTP_200_OK)

            category.isDeleted = True
            category.save()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Category deleted successfully."
            }, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while deleting category.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#----------------Catalog Image -----------------

class CatalogImageCreateAPIView(APIView):
    def post(self, request):
        try:
            serializer = CatalogImageSerializer(data=request.data, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Catalog Image created successfully.",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)

            return Response({
                "status": False,
                "statusCode": 200,
                "message": "Validation failed.",
                "error": serializer.errors
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 200,
                "message": "Server error",
                "error": str(e)
            }, status=status.HTTP_200_OK)


# class CatalogImageListAPIView(APIView):
#     def get(self, request):
#         try:
#             category_id = request.query_params.get("category")

#             queryset = CatalogImage.objects.filter(isDeleted=False)

#             if category_id:
#                 queryset = queryset.filter(category_id=category_id)

#             serializer = CatalogImageSerializer(
#                 queryset, many=True, context={"request": request}
#             )

#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Catalog Image list fetched successfully.",
#                 "data": serializer.data
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 200,
#                 "message": "Server error",
#                 "error": str(e)
#             }, status=status.HTTP_200_OK)


class CatalogImageListAPIView(APIView):
    def get(self, request):
        try:
            name = request.query_params.get("name", "").strip()

            queryset = CatalogImage.objects.filter(isDeleted=False)

            # 🔹 Search ONLY by name
            if name:
                queryset = queryset.filter(name__icontains=name)

            queryset = queryset.order_by("-id")

            # 🔹 Pagination (EXACTLY like reference API)
            paginator = CustomPagination()
            page = paginator.paginate_queryset(queryset, request)

            serializer = CatalogImageSerializer(
                page, many=True, context={"request": request}
            )

            response = {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Catalog Image list fetched successfully.",
                "data": serializer.data,
                "pagination": {
                    "page": paginator.page.number,
                    "page_size": paginator.get_page_size(request),
                    "total_pages": paginator.page.paginator.num_pages,
                    "total_items": paginator.page.paginator.count
                }
            }

            return Response(response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 200,
                "message": "Server error",
                "error": str(e)
            }, status=status.HTTP_200_OK)


class CatalogImageDetailAPIView(APIView):
    def get(self, request, pk):
        try:
            catalog_image = get_object_or_404(CatalogImage, pk=pk, isDeleted=False)
            serializer = CatalogImageSerializer(catalog_image, context={"request": request})

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Catalog Image details fetched successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 200,
                "message": "Server error",
                "error": str(e)
            }, status=status.HTTP_200_OK)


class CatalogImageUpdateAPIView(APIView):
    def put(self, request, pk):
        try:
            catalog_image = get_object_or_404(CatalogImage, pk=pk, isDeleted=False)

            serializer = CatalogImageSerializer(
                catalog_image,
                data=request.data,
                partial=True,
                context={"request": request}
            )

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Catalog Image updated successfully.",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)

            return Response({
                "status": False,
                "statusCode": 200,
                "message": "Validation failed.",
                "error": serializer.errors
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 200,
                "message": "Server error",
                "error": str(e)
            }, status=status.HTTP_200_OK)


class CatalogImageDeleteAPIView(APIView):
    def delete(self, request, pk):
        try:
            catalog_image = get_object_or_404(CatalogImage, pk=pk, isDeleted=False)
            catalog_image.isDeleted = True
            catalog_image.save()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Catalog Image deleted successfully."
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 200,
                "message": "Server error",
                "error": str(e)
            }, status=status.HTTP_200_OK)
