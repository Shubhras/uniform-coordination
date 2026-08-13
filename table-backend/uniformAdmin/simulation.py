from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from .models import Category, Product, SimulationStructure, Fabric, Colors, TableShape, Closure, Style, Size, Pattern
from uniformAdmin.fabric import IsAdministrator

DEFAULT_STRUCTURES = {
    "Tablecloths": [
        { "attribute": "Fabric", "enabled": True, "order": "1" },
        { "attribute": "Style", "enabled": True, "order": "2" },
        { "attribute": "Color", "enabled": False, "order": "3" },
        { "attribute": "Size", "enabled": False, "order": "4" },
        { "attribute": "Pattern", "enabled": False, "order": "5" },
    ],
    "Chair Covers": [
        { "attribute": "Fabric", "enabled": True, "order": "1" },
        { "attribute": "Fit Type", "enabled": True, "order": "2" },
        { "attribute": "Color", "enabled": False, "order": "3" },
        { "attribute": "Closure", "enabled": False, "order": "4" },
        { "attribute": "Stretch", "enabled": False, "order": "5" },
    ],
    "Napkins": [
        { "attribute": "Fabric", "enabled": True, "order": "1" },
        { "attribute": "Fold Style", "enabled": True, "order": "2" },
        { "attribute": "Color", "enabled": False, "order": "3" },
        { "attribute": "Size", "enabled": False, "order": "4" },
        { "attribute": "Trim", "enabled": False, "order": "5" },
    ],
    "Centerpieces": [
        { "attribute": "Style", "enabled": True, "order": "1" },
        { "attribute": "Height", "enabled": True, "order": "2" },
        { "attribute": "Color", "enabled": False, "order": "3" },
        { "attribute": "Flowers", "enabled": False, "order": "4" },
        { "attribute": "Base Type", "enabled": False, "order": "5" },
    ],
    "Tableware": [
        { "attribute": "Material", "enabled": True, "order": "1" },
        { "attribute": "Finish", "enabled": True, "order": "2" },
        { "attribute": "Color", "enabled": False, "order": "3" },
        { "attribute": "Collection", "enabled": False, "order": "4" },
        { "attribute": "Pieces", "enabled": False, "order": "5" },
    ],
    "Additional Decor": [
        { "attribute": "Style", "enabled": True, "order": "1" },
        { "attribute": "Color", "enabled": True, "order": "2" },
        { "attribute": "Size", "enabled": False, "order": "3" },
        { "attribute": "Material", "enabled": False, "order": "4" },
        { "attribute": "Placement", "enabled": False, "order": "5" },
    ],
}

class SimulationStructureAPIView(APIView):
    """
    Get or Update Simulation Structure Config for Categories.
    """
    permission_classes = [AllowAny] # Set to AllowAny for client requests, write will use admin checks if desired.
    
    def get(self, request):
        try:
            # Load all categories
            categories = Category.objects.filter(isDeleted=False, type='table')
            response_data = {}
            
            for cat in categories:
                # Try to get existing config
                config_obj = SimulationStructure.objects.filter(category=cat).first()
                if config_obj and config_obj.structure_data:
                    response_data[cat.categoryName] = config_obj.structure_data.get("attributes", [])
                else:
                    # Fallback to default
                    response_data[cat.categoryName] = DEFAULT_STRUCTURES.get(cat.categoryName, [
                        { "attribute": "Fabric", "enabled": True, "order": "1" },
                        { "attribute": "Style", "enabled": False, "order": "2" },
                        { "attribute": "Color", "enabled": False, "order": "3" },
                    ])
            
            # Include defaults for any categories missing in db but expected
            for key, val in DEFAULT_STRUCTURES.items():
                if key not in response_data:
                    response_data[key] = val

            return Response({
                "status": True,
                "statusCode": 200,
                "data": response_data
            }, status=status.HTTP_200_OK)
            
        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Error fetching simulation structures",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        # Allow administrators to save structure
        category_name = request.data.get("categoryName")
        attributes = request.data.get("attributes")
        
        if not category_name or attributes is None:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "categoryName and attributes are required."
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            category = Category.objects.filter(categoryName=category_name, isDeleted=False).first()
            if not category:
                category = Category.objects.create(
                    categoryName=category_name,
                    type='table',
                    isActive=True
                )
                
            config_obj, created = SimulationStructure.objects.get_or_create(category=category)
            config_obj.structure_data = {"attributes": attributes}
            config_obj.save()
            
            return Response({
                "status": True,
                "statusCode": 200,
                "message": f"Simulation structure for {category_name} saved successfully.",
                "data": config_obj.structure_data.get("attributes")
            }, status=status.HTTP_200_OK)
            
        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Error saving simulation structure",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProductSimulationVisibilityAPIView(APIView):
    """
    Toggle a product's visibility in the simulation.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        product_id = request.data.get("product_id")
        show_in_simulation = request.data.get("show_in_simulation")
        
        if product_id is None or show_in_simulation is None:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "product_id and show_in_simulation are required."
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            product = get_object_or_404(Product, id=product_id)
            product.show_in_simulation = bool(show_in_simulation)
            product.save()
            
            return Response({
                "status": True,
                "statusCode": 200,
                "message": f"Product visibility updated successfully to {product.show_in_simulation}."
            }, status=status.HTTP_200_OK)
            
        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Error toggling product simulation visibility",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SimulationOptionsAPIView(APIView):
    """
    Get dynamic fabrics, styles, colors, sizes for simulation preview
    based on selected category and table shape.
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        category_name = request.query_params.get("category_name", "").strip()
        table_shape = request.query_params.get("table_shape", "").strip()
        
        try:
            # Start filtering products
            products = Product.objects.filter(
                isActive=True, 
                isDeleted=False, 
                show_in_simulation=True,
                productType='table'
            )
            
            if category_name:
                products = products.filter(category__categoryName__iexact=category_name)
                
            if table_shape:
                # Map frontend shape to backend TABLE_SHAPE_CHOICES
                # Frontend: circle, rectangle, square
                # Backend: round, rectangle, square, oval
                shape_map = {
                    "circle": "round",
                    "rectangle": "rectangle",
                    "square": "square"
                }
                backend_shape = shape_map.get(table_shape.lower())
                if backend_shape:
                    from django.db.models import Q
                    # Accessories might have null table_shape, so allow null OR specific match
                    products = products.filter(Q(table_shape__iexact=backend_shape) | Q(table_shape__isnull=True) | Q(table_shape=""))

            # Build list of unique fabrics, styles, colors
            fabrics_set = set()
            styles_set = set()
            colors_set = set()
            sizes_set = set()
            
            fabrics_list = []
            styles_list = []
            colors_list = []
            sizes_list = []
            
            for prod in products:
                # Fabric
                if prod.fabric and prod.fabric.id not in fabrics_set:
                    fabrics_set.add(prod.fabric.id)
                    fb_img = getattr(prod.fabric, "image", None)
                    fabrics_list.append({
                        "id": str(prod.fabric.id),
                        "label": prod.fabric.fabricName,
                        "image": request.build_absolute_uri(fb_img.url) if (fb_img and hasattr(fb_img, "url")) else None,
                        "materialType": prod.fabric.materialType
                    })
                    
                # Style
                if prod.style and prod.style not in styles_set:
                    styles_set.add(prod.style)
                    styles_list.append({
                        "id": prod.style.lower(),
                        "label": prod.style.capitalize(),
                        "image": None
                    })
                    
                # Color
                if prod.color and prod.color.id not in colors_set:
                    colors_set.add(prod.color.id)
                    colors_list.append({
                        "id": str(prod.color.id),
                        "label": prod.color.colorName,
                        "colorCode": prod.color.colorCode or "#ffffff",
                        "image": None,
                        "compatibleFabric": prod.color.compatibleFabric or []
                    })
                
                # Size
                if prod.size and prod.size not in sizes_set:
                    sizes_set.add(prod.size)
                    sizes_list.append({
                        "id": prod.size.lower(),
                        "label": prod.size
                    })

            # Query DB attribute models for dynamic admin-configured options strictly filtered by category
            db_fabrics = Fabric.objects.filter(isActive=True, isDeleted=False)
            if category_name:
                db_fabrics = db_fabrics.filter(category__categoryName__iexact=category_name)

            if db_fabrics.exists():
                for fb in db_fabrics:
                    if str(fb.id) not in fabrics_set and fb.fabricName not in fabrics_set:
                        fabrics_set.add(str(fb.id))
                        fabrics_set.add(fb.fabricName)
                        fb_img = getattr(fb, "image", None)
                        fabrics_list.append({
                            "id": str(fb.id),
                            "label": fb.fabricName,
                            "image": request.build_absolute_uri(fb_img.url) if (fb_img and hasattr(fb_img, "url")) else None,
                            "materialType": fb.materialType or "cotton"
                        })

            db_colors = Colors.objects.filter(isActive=True, isDeleted=False)
            if category_name:
                db_colors = db_colors.filter(category__categoryName__iexact=category_name)

            if db_colors.exists():
                for cl in db_colors:
                    if str(cl.id) not in colors_set and cl.colorName not in colors_set:
                        colors_set.add(str(cl.id))
                        colors_set.add(cl.colorName)
                        colors_list.append({
                            "id": str(cl.id),
                            "label": cl.colorName,
                            "colorCode": cl.colorCode or "#ffffff",
                            "image": None,
                            "compatibleFabric": cl.compatibleFabric or []
                        })

            db_table_shapes = TableShape.objects.filter(isActive=True, isDeleted=False)
            if category_name:
                cat_table_shapes = db_table_shapes.filter(category__categoryName__iexact=category_name)
                if cat_table_shapes.exists():
                    db_table_shapes = cat_table_shapes

            table_shapes_list = [
                {"id": str(ts.id), "label": ts.name, "image": request.build_absolute_uri(ts.image.url) if (getattr(ts, "image", None) and hasattr(ts.image, "url")) else None}
                for ts in db_table_shapes
            ]

            db_closures = Closure.objects.filter(isActive=True, isDeleted=False)
            if category_name:
                db_closures = db_closures.filter(category__categoryName__iexact=category_name)

            closures_list = [
                {"id": str(c.id), "label": c.name, "image": request.build_absolute_uri(c.image.url) if (getattr(c, "image", None) and hasattr(c.image, "url")) else None}
                for c in db_closures
            ]

            db_styles = Style.objects.filter(isActive=True, isDeleted=False)
            if category_name:
                db_styles = db_styles.filter(category__categoryName__iexact=category_name)

            if db_styles.exists():
                styles_list = [
                    {"id": str(s.id), "label": s.name, "image": request.build_absolute_uri(s.image.url) if (getattr(s, "image", None) and hasattr(s.image, "url")) else None}
                    for s in db_styles
                ]

            db_sizes = Size.objects.filter(isActive=True, isDeleted=False)
            if category_name:
                db_sizes = db_sizes.filter(category__categoryName__iexact=category_name)

            if db_sizes.exists():
                sizes_list = [
                    {"id": str(sz.id), "label": sz.name, "image": request.build_absolute_uri(sz.image.url) if (getattr(sz, "image", None) and hasattr(sz.image, "url")) else None}
                    for sz in db_sizes
                ]

            db_patterns = Pattern.objects.filter(isActive=True, isDeleted=False)
            if category_name:
                db_patterns = db_patterns.filter(category__categoryName__iexact=category_name)

            patterns_list = [
                {"id": str(pt.id), "label": pt.name, "image": request.build_absolute_uri(pt.image.url) if (getattr(pt, "image", None) and hasattr(pt.image, "url")) else None}
                for pt in db_patterns
            ]

            # Only fallback to static defaults if NO category is specified
            if not category_name:
                if not fabrics_list:
                    fabrics_list = [
                        { "id": "crushed-velvet", "label": "Crushed Velvet", "image": None, "materialType": "cotton" },
                        { "id": "damask-linen", "label": "Damask Linen", "image": None, "materialType": "linen" },
                        { "id": "gingham-cotton", "label": "Gingham Cotton", "image": None, "materialType": "cotton" },
                    ]
                if not styles_list:
                    styles_list = [
                        { "id": "round", "label": "Round", "image": None },
                        { "id": "square", "label": "Square", "image": None },
                    ]
                if not colors_list:
                    colors_list = [
                        { "id": "white", "label": "White", "image": None, "colorCode": "#ffffff", "compatibleFabric": ["cotton", "linen"] },
                        { "id": "ivory", "label": "Ivory", "image": None, "colorCode": "#fffff0", "compatibleFabric": ["cotton"] },
                        { "id": "beige", "label": "Beige", "image": None, "colorCode": "#f5f5dc", "compatibleFabric": ["linen"] },
                    ]

            return Response({
                "status": True,
                "statusCode": 200,
                "data": {
                    "fabrics": fabrics_list,
                    "styles": styles_list,
                    "colors": colors_list,
                    "sizes": sizes_list,
                    "closures": closures_list,
                    "patterns": patterns_list,
                    "table_shapes": table_shapes_list,
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Error extracting simulation options",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SimulationCategoryListAPIView(APIView):
    """
    List all categories with SimulationStructure structure configuration.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # Fetch all SimulationStructure objects
            structures = SimulationStructure.objects.filter(
                category__isDeleted=False,
                category__isActive=True
            ).select_related('category')
            
            data = []
            for struct in structures:
                cat = struct.category
                # Build category icon url or fallback
                icon_url = ""
                if cat.categoryImage:
                    icon_url = request.build_absolute_uri(cat.categoryImage.url)
                
                # Check for default icon fallback based on name if no image uploaded
                if not icon_url:
                    name_lower = cat.categoryName.lower()
                    if "tablecloth" in name_lower:
                        icon_url = "/img/table-form/category/tablecloths.png"
                    elif "napkin" in name_lower:
                        icon_url = "/img/table-form/category/napkins.png"
                    elif "chair" in name_lower:
                        icon_url = "/img/table-form/category/chair-cover.png"
                    elif "piece" in name_lower or "center" in name_lower or "centre" in name_lower:
                        icon_url = "/img/table-form/category/centre-pieces.png"
                    elif "tableware" in name_lower:
                        icon_url = "/img/table-form/category/tableware.png"
                    else:
                        icon_url = "/img/table-form/category/centre-pieces.png"

                data.append({
                    "id": cat.id,
                    "name": cat.categoryName,
                    "icon": icon_url,
                    "attributes": struct.structure_data.get("attributes", [])
                })
            
            return Response({
                "status": True,
                "statusCode": 200,
                "data": data
            }, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Error fetching simulation categories",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
