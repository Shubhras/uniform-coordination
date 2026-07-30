from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Category, Blog, FAQ, FAQDescription, CatalogImage ,TableTheme
from drf_spectacular.utils import extend_schema,OpenApiExample,OpenApiResponse,OpenApiParameter,OpenApiTypes
from django.conf import settings

@extend_schema(
    tags=["HomePage API"],
    responses={
        200: OpenApiResponse(description="Home page data fetched successfully"),
        # 404: OpenApiResponse(description="Homepage not found"),
        # 500: OpenApiResponse(description="Internal server error"),
    },
)



def build_media_url(request, file_field):
    if not file_field:
        return None

    # Already an absolute URL (e.g. Unsplash)
    if file_field.name.startswith(("http://", "https://")):
        return file_field.name

    return f"{settings.SITE_URL}{file_field.url}"
    
class HomePageAPIView(APIView):

    def get(self, request):

        # ✅ GET TYPE (uniform / table) - Defaulting to table for KIREIZ SPACE
        page_type = request.query_params.get("type", "table")
        if page_type:
            page_type = page_type.lower()
        if page_type not in ["uniform", "table"]:
            page_type = "table"

        # ------- CATEGORIES -------
        categories = Category.objects.filter(
            isActive=True,
            isDeleted=False
        )

        if page_type in ["uniform", "table"]:
            categories = categories.filter(type=page_type)

        categories = categories.order_by("order")

        categories_data = []
        for c in categories:
            categories_data.append({
                "id": c.id,
                "categoryName": c.categoryName,
                "slug": c.slug,
                "description": c.description,
                # "categoryImage": request.build_absolute_uri(c.categoryImage.url) if c.categoryImage else None
                "categoryImage": build_media_url(request, c.categoryImage)
            })

        # ------- BLOGS -------
        blogs = Blog.objects.filter(
            isActive=True,
            isDeleted=False
        )

        if page_type in ["uniform", "table"]:
            blogs = blogs.filter(type=page_type)

        blogs = blogs.order_by("-created_at")[:10]

        blogs_data = []
        for b in blogs:
            image_url = None
            if b.image:
                if b.image.name.startswith("http://") or b.image.name.startswith("https://"):
                    image_url = b.image.name
                else:
                    # image_url = request.build_absolute_uri(b.image.url)
                    image_url = build_media_url(request, b.image)

            blogs_data.append({
                "id": b.id,
                "title": b.title,
                "slug": b.slug,
                "image": image_url,
                "category": b.category.categoryName if b.category else None,
                "description": b.description,
                "created_at":b.created_at,
                "updated_at":b.updated_at,
                "type": b.type
            })

        # ------- FAQ -------
        faqs = FAQ.objects.filter(
            isActive=True,
            isDeleted=False
        )

        if page_type in ["uniform", "table"]:
            faqs = faqs.filter(type=page_type)

        faqs_data = []
        for f in faqs:

            descriptions = FAQDescription.objects.filter(
                faq=f,
                isActive=True,
                isDeleted=False
            )

            desc_list = []
            for d in descriptions:
                desc_list.append({
                    "id": d.id,
                    "description": d.description
                })

            faqs_data.append({
                "id": f.id,
                "title": f.title,
                "type": f.type,
                "descriptions": desc_list
            })

        # ------- CATALOG IMAGES (OPTIONAL FILTER IF HAS TYPE) -------
        catalog_images = CatalogImage.objects.filter(
            isActive=True,
            isDeleted=False
        )

        # If CatalogImage has `type` field
        if hasattr(CatalogImage, "type") and page_type in ["uniform", "table"]:
            catalog_images = catalog_images.filter(type=page_type)

        catalog_images = catalog_images[:10]

        catalog_images_data = []
        for ci in catalog_images:
            image_url = None
            if ci.image:
                if ci.image.name.startswith("http://") or ci.image.name.startswith("https://"):
                    image_url = ci.image.name
                else:
                    # image_url = request.build_absolute_uri(ci.image.url)
                    image_url = build_media_url(request, ci.image)

            catalog_images_data.append({
                "id": ci.id,
                "name": ci.name,
                "slug": ci.slug,
                "image": image_url,
                "category": ci.category.categoryName if ci.category else None,
                "description": ci.description
            })
            
            
            
        # ------- TABLE THEMES -------
        table_themes = TableTheme.objects.filter(
            is_active=True,
            isDeleted=False
        )

        # Only for table type
        if page_type == "table":
            table_themes = table_themes.order_by("order", "-created_at")
        else:
            table_themes = TableTheme.objects.none()

        table_themes_data = []

        for theme in table_themes:
            table_themes_data.append({
                "id": theme.id,
                "title": theme.title,
                "category": {
                    "id": theme.category.id,
                    "name": theme.category.categoryName
                } if theme.category else None,
                "description": theme.description,
                "image": build_media_url(request, theme.image),
                "order": theme.order,
            })    

        # ------- FINAL RESPONSE -------
        return Response({
            "status": True,
            "message": "Home page data fetched successfully",
            "data": {
                "type": page_type,
                "table_themes": table_themes_data,
                "categories": categories_data,
                "blogs": blogs_data,
                "faqs": faqs_data,
                "catalog_images": catalog_images_data
            }
        })
