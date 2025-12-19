from django.urls import path
from uniformAdmin.views import *
from .fabric import *
from .parts import *
from .colours import *
from .templates import *
from .faqs import *
from .blog import *
from .category import *
from .subcategory import *
from .catelogimage import *


urlpatterns = [
    path('login/', AdminLoginAPIView.as_view(), name='admin-login'),
    path('change-password/', AdminChangePasswordAPIView.as_view(), name='admin-change-password'),
    path('update-profile/', AdminUpdateProfileAPIView.as_view(), name='admin-change-password'),
    path('profile/', AdminDetailAPIView.as_view(), name='admin-details'),
    path('logout/', AdminLogoutAPIView.as_view(), name='admin-details'),
    path('forgot-password/', AdminForgotPasswordAPIView.as_view(), name='forgot-password'),

    # Fabric URLs
    path('fabric/create/', FabricCreateView.as_view()),
    path('fabric/list/', FabricListView.as_view()),
    path('fabric/<int:pk>/', FabricDetailView.as_view()),
    path('fabric/update/<int:pk>/', FabricUpdateView.as_view()),
    path('fabric/delete/<int:pk>/', FabricDeleteView.as_view()),

    # Parts URLs
    path("parts/list/", PartsListView.as_view()),
    path("parts/create/", PartsCreateView.as_view()),
    path("parts/<int:pk>/", PartsDetailView.as_view()),
    path("parts/update/<int:pk>/", PartsUpdateView.as_view()),
    path("parts/delete/<int:pk>/", PartsDeleteView.as_view()),
    # path("parts/<int:pk>/restore/", PartsRestoreView.as_view()),

    # Colours URLs
    path("colors/create/", ColorsCreateView.as_view(), name="create-color"),
    path("colors/list/", ColorsListView.as_view(), name="list-colors"),
    path("colors/<int:id>/", ColorsDetailView.as_view(), name="get-color"),
    path("colors/update/<int:id>/", ColorsUpdateView.as_view(), name="update-color"),
    path("colors/delete/<int:id>/", ColorsDeleteView.as_view(), name="delete-color"),

    # Template URLs
    path("templates/create/", TemplateCreateView.as_view(), name="create-template"),
    path("templates/list/", TemplateListView.as_view(), name="list-templates"),
    path("templates/<int:id>/", TemplateDetailView.as_view(), name="get-template"),
    path("templates/update/<int:id>/", TemplateUpdateView.as_view(), name="update-template"),
    path("templates/delete/<int:id>/", TemplateDeleteView.as_view(), name="delete-template"),
    
    
    
    #Blog URLs 
    path("blogs/create/", BlogCreateAPIView.as_view(), name="blog-create"),
    path("blogs/list/", BlogListAPIView.as_view(), name="blog-list"),
    path("blogs/detail/<int:blog_id>/", BlogDetailAPIView.as_view(), name="blog-detail"),
    path("blogs/update/<int:blog_id>/", BlogUpdateAPIView.as_view(), name="blog-update"),
    path("blogs/delete/<int:blog_id>/", BlogDeleteAPIView.as_view(), name="blog-delete-single"),
    # path("blogs/delete/", BlogDeleteAPIView.as_view(), name="blog-delete-multiple"),


    #FAQs
    path("faqs/create/", FAQCreateAPIView.as_view(), name="faqs-create"),
    path("faqs/list/", FAQListAPIView.as_view(), name="faqs-list"),
    path("faqs/detail/<int:faq_id>/", FAQDetailAPIView.as_view(), name="faqs-detail"),
    path("faqs/update/<int:faq_id>/", FAQUpdateAPIView.as_view(), name="faqs-update"),
    path("faqs/delete/<int:faq_id>/", FAQDeleteAPIView.as_view(), name="faqs-delete"),
    
    
    
    #Categories
    path("categories/create/", CategoryCreateAPIView.as_view(), name="categories-create"),
    path("categories/list/", CategoryListAPIView.as_view(), name="categories-list"),
    path("categories/detail/<int:category_id>/", CategoryDetailAPIView.as_view(), name="categories-detail"),
    path("categories/update/<int:category_id>/", CategoryUpdateAPIView.as_view(), name="categories-update"),
    path("categories/delete/<int:category_id>/", CategoryDeleteAPIView.as_view(), name="categories-delete"),
    path("categories/reorder/", CategoryReorderAPIView.as_view(), name="categories-reorder"),
    
   
    #Catalog Image
    path("catalog-image/create/", CatalogImageCreateAPIView.as_view(),name="catalog-image-create"),
    path("catalog-image/list/", CatalogImageListAPIView.as_view(),name="catalog-image-list"),
    path("catalog-image/detail/<int:pk>/", CatalogImageDetailAPIView.as_view(),name="catalog-image-detail"),
    path("catalog-image/update/<int:pk>/", CatalogImageUpdateAPIView.as_view(),name="catalog-image-update"),
    path("catalog-image/delete/<int:pk>/", CatalogImageDeleteAPIView.as_view(),name="catalog-image-delete"), 
    
    
    
    path("subcategory/create/", SubCategoryCreateAPIView.as_view(),name="subcategory-create"),
    path("subcategory/list/", SubCategoryListAPIView.as_view(),name="subcategory-list"),
    path("subcategory/detail/<int:pk>/", SubCategoryDetailAPIView.as_view(),name="subcategory-detail"),
    path("subcategory/update/<int:pk>/", SubCategoryUpdateAPIView.as_view(),name="subcategory-create"),
    path("subcategory/delete/<int:pk>/", SubCategoryDeleteAPIView.as_view(),name="subcategory-create"),

    
]
