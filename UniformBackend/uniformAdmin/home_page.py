from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Category, Blog, FAQ, FAQDescription, CatalogImage


# class HomePageAPIView(APIView):

#     def get(self, request):

#         # ------- CATEGORIES -------
#         categories = Category.objects.filter(
#             isActive=True,
#             isDeleted=False
#         ).order_by("order")

#         categories_data = []
#         for c in categories:
#             categories_data.append({
#                 "id": c.id,
#                 "categoryName": c.categoryName,
#                 "slug": c.slug,
#                 "description": c.description,
#                 "categoryImage": request.build_absolute_uri(c.categoryImage.url) if c.categoryImage else None
#             })

#         # ------- BLOGS -------
#         blogs = Blog.objects.filter(
#             isActive=True,
#             isDeleted=False
#         ).order_by("-created_at")[:10]

#         blogs_data = []
#         for b in blogs:
#             blogs_data.append({
#                 "id": b.id,
#                 "title": b.title,
#                 "slug": b.slug,
#                 "image": request.build_absolute_uri(b.image.url) if b.image else None,
#                 "category": b.category.categoryName if b.category else None,
#                 "description": b.description,
#                 "type": b.type
#             })

#         # ------- FAQ -------
#         faqs = FAQ.objects.filter(
#             isActive=True,
#             isDeleted=False
#         )

#         faqs_data = []

#         for f in faqs:

#             descriptions = FAQDescription.objects.filter(
#                 faq=f,
#                 isActive=True,
#                 isDeleted=False
#             )

#             desc_list = []
#             for d in descriptions:
#                 desc_list.append({
#                     "id": d.id,
#                     "description": d.description
#                 })

#             faqs_data.append({
#                 "id": f.id,
#                 "title": f.title,
#                 "type": f.type,
#                 "descriptions": desc_list
#             })

#         # ------- CATALOG IMAGES -------
#         catalog_images = CatalogImage.objects.filter(
#             isActive=True,
#             isDeleted=False
#         )[:10]

#         catalog_images_data = []

#         for ci in catalog_images:
#             catalog_images_data.append({
#                 "id": ci.id,
#                 "name": ci.name,
#                 "slug": ci.slug,
#                 "image": request.build_absolute_uri(ci.image.url) if ci.image else None,
#                 "category": ci.category.categoryName if ci.category else None,
#                 "description": ci.description
#             })

#         # ------- FINAL RESPONSE -------
#         return Response({
#             "status": True,
#             "message": "Home page data fetched successfully",
#             "data": {
#                 "categories": categories_data,
#                 "blogs": blogs_data,
#                 "faqs": faqs_data,
#                 "catalog_images": catalog_images_data
#             }
#         })


class HomePageAPIView(APIView):

    def get(self, request):

        # ✅ GET TYPE (uniform / table)
        page_type = request.query_params.get("type")

        if page_type:
            page_type = page_type.lower()

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
                "categoryImage": request.build_absolute_uri(c.categoryImage.url) if c.categoryImage else None
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
            blogs_data.append({
                "id": b.id,
                "title": b.title,
                "slug": b.slug,
                "image": request.build_absolute_uri(b.image.url) if b.image else None,
                "category": b.category.categoryName if b.category else None,
                "description": b.description,
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
            catalog_images_data.append({
                "id": ci.id,
                "name": ci.name,
                "slug": ci.slug,
                "image": request.build_absolute_uri(ci.image.url) if ci.image else None,
                "category": ci.category.categoryName if ci.category else None,
                "description": ci.description
            })

        # ------- FINAL RESPONSE -------
        return Response({
            "status": True,
            "message": "Home page data fetched successfully",
            "data": {
                "type": page_type,
                "categories": categories_data,
                "blogs": blogs_data,
                "faqs": faqs_data,
                "catalog_images": catalog_images_data
            }
        })
