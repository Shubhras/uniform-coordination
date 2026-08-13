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
from .promocode import*
from .privacyandpolicy import *
from .unitprice import*
from .auth import * 
from .home_page import *
from .Inventory import *
from .table_theme import *
from .pricing import *
from .reports import ReportsAnalyticsAPIView, ExportReportsAnalyticsAPIView
from .system_settings_views import *
from .ai_views import *
from .menu import *
from .permissions import *
from .system_settings_views import *
from .simulation import *
from .attributes import *





urlpatterns = [
    path('signup/', AdminSignupAPIView.as_view(), name='admin-signup'),
    path('login/', AdminLoginAPIView.as_view(), name='admin-login'),
    path('change-password/',ChangePasswordAPIView.as_view(), name='admin-change-password'),
    path('update-profile/', UpdateProfileAPIView.as_view(), name='admin-change-password'),
    path('profile/',ProfileAPIView.as_view(), name='admin-details'),
    path('logout/', LogoutAPIView.as_view(), name='admin-details'),
    path('forgot-password/', ForgotPasswordAPIView.as_view(), name='forgot-password'),

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

    # Table Shapes URLs
    path("table-shapes/create/", TableShapeCreateView.as_view(), name="create-table-shape"),
    path("table-shapes/list/", TableShapeListView.as_view(), name="list-table-shapes"),
    path("table-shapes/<int:id>/", TableShapeDetailView.as_view(), name="get-table-shape"),
    path("table-shapes/update/<int:id>/", TableShapeUpdateView.as_view(), name="update-table-shape"),
    path("table-shapes/delete/<int:id>/", TableShapeDeleteView.as_view(), name="delete-table-shape"),

    # Closures URLs
    path("closures/create/", ClosureCreateView.as_view(), name="create-closure"),
    path("closures/list/", ClosureListView.as_view(), name="list-closures"),
    path("closures/<int:id>/", ClosureDetailView.as_view(), name="get-closure"),
    path("closures/update/<int:id>/", ClosureUpdateView.as_view(), name="update-closure"),
    path("closures/delete/<int:id>/", ClosureDeleteView.as_view(), name="delete-closure"),

    # Styles URLs
    path("styles/create/", StyleCreateView.as_view(), name="create-style"),
    path("styles/list/", StyleListView.as_view(), name="list-styles"),
    path("styles/<int:id>/", StyleDetailView.as_view(), name="get-style"),
    path("styles/update/<int:id>/", StyleUpdateView.as_view(), name="update-style"),
    path("styles/delete/<int:id>/", StyleDeleteView.as_view(), name="delete-style"),

    # Sizes URLs
    path("sizes/create/", SizeCreateView.as_view(), name="create-size"),
    path("sizes/list/", SizeListView.as_view(), name="list-sizes"),
    path("sizes/<int:id>/", SizeDetailView.as_view(), name="get-size"),
    path("sizes/update/<int:id>/", SizeUpdateView.as_view(), name="update-size"),
    path("sizes/delete/<int:id>/", SizeDeleteView.as_view(), name="delete-size"),

    # Patterns URLs
    path("patterns/create/", PatternCreateView.as_view(), name="create-pattern"),
    path("patterns/list/", PatternListView.as_view(), name="list-patterns"),
    path("patterns/<int:id>/", PatternDetailView.as_view(), name="get-pattern"),
    path("patterns/update/<int:id>/", PatternUpdateView.as_view(), name="update-pattern"),
    path("patterns/delete/<int:id>/", PatternDeleteView.as_view(), name="delete-pattern"),

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

    path("product/create/", AdminCreateProductAPIView.as_view()),
    path("product/update/<int:pk>/", AdminUpdateProductAPIView.as_view()),
    path("product/get/<int:pk>/", AdminGetProductAPIView.as_view()),
    path("product/list/", AdminListProductsAPIView.as_view()),
    path("product/delete/<int:pk>/", AdminDeleteProductAPIView.as_view()),
    
    
    path("promocode/create/", PromocodeCreateAPIView.as_view(),name="promocode-create"),
    path("promocode/list/", PromocodeListAPIView.as_view(),name="promocode-list"),
    path("promocode/detail/<int:pk>/", PromocodeDetailAPIView.as_view(),name="promocode-detail"),
    path("promocode/update/<int:pk>/", PromocodeUpdateAPIView.as_view(),name="promocode-update"),
    path("promocode/delete/<int:pk>/", PromocodeDeleteAPIView.as_view(),name="promocode-delete"),
    
    
    path("privacy-policy/create/", PrivacyPolicyCreateAPIView.as_view(),name="privacypolicy-create"),
    path("privacy-policy/list/", PrivacyPolicyListAPIView.as_view(),name="privacypolicy-list"),
    path("privacy-policy/detail/<int:pk>/", PrivacyPolicyDetailAPIView.as_view(),name="privacypolicy-detail"),
    path("privacy-policy/update/<int:pk>/", PrivacyPolicyUpdateAPIView.as_view(),name="privacypolicy-update"),
    path("privacy-policy/delete/<int:pk>/", PrivacyPolicyDeleteAPIView.as_view(),name="privacypolicy-delete"),

    #<--------------------SpecialCondition--------------------->
    path('specialcondition/create/',SpecialConditionCreateAPIView.as_view(), name = 'SpecialCondition-create'),
    path('specialcondition/get-list/',SpecialConditionListAPIView.as_view(), name = 'SpecialCondition-get-list'),
    path('specialcondition/<int:id>/get/',SpecialConditionDetailAPIView.as_view(), name = 'SpecialCondition-get-detail'),
    path('specialcondition/<int:id>/update/',SpecialConditionUpdateAPIView.as_view(), name = 'SpecialCondition-update'),
    # path('specialcondition/delete/',SpecialConditionDeleteAPIView.as_view(), name = 'SpecialCondition-delete'),
    
    path("specialcondition/delete/<str:id>/",SpecialConditionDeleteAPIView.as_view(),name="SpecialCondition-delete-by-id",),
  
    
    #<-------------------QuotationRequestList------------------->
    path('quotationrequest/get/',QuotationRequestListAPIView.as_view(), name = 'QuotationRequest-getlist'),

    #<-------------------QuotationTamplate----------------------->
    path('quotationrequesttamplate/create/',QuotationTemplateCreateAPIView.as_view(), name='QuotationRequest-create'),
    path('quotationrequesttamplate/get-list/',QuotationTemplateListAPIView.as_view(), name='QuotationRequest-create'),
    path('quotationrequesttamplate/<str:quotation_id>/get/',QuotationTemplateDetailAPIView.as_view(), name='QuotationRequest-create'),
    path('quotationrequesttamplate/<str:quotation_id>/update/',QuotationTemplateUpdateAPIView.as_view(), name='QuotationRequest-create'),
    path('quotationrequesttamplate/delete/',QuotationTemplateDeleteAPIView.as_view(), name='QuotationRequest-create'),
    path('quotationrequesttamplate/<str:quotation_id>/export/',QuotationTamplateExportAPIView.as_view(),name='get-export'),

    #<---------------------AdminuserNotification------------------>
    path("notifications/get-list/", AdminNotificationListAPIView.as_view(),name='adminNotification-get_list'),
    path("admin-notification/<int:pk>/",AdminNotificationDetailAPIView.as_view(),name="admin-notification-detail",),
    path("notifications/delete/", AdminNotificationDeleteAPIView.as_view(),name="adminNotification-delete_all"),

    #<------------------------B2B-------------------------------->
    path('admin-user/create/',AdminUserCreateAPIView.as_view(), name = 'admin-user-create'),
    path('admin-user/get-list/',AdminUserListAPIView.as_view(), name = 'admin-user-get-list'),
    path('admin-user/<int:id>/get/',AdminUserDetailAPIView.as_view(), name = 'admin-user-detail-get'),
    path('admin-user/<int:id>/update/',AdminUserUpdateAPIView.as_view(), name = 'admin-user-update'),
    path('admin-user/delete/',AdminUserDeleteAPIView.as_view(), name = 'admin-user-delete'),
    
    
    # customer list-details 
    path("customers/list/",CustomerListAPIView.as_view(),name="admin-customer-list",),
    path("customers/<int:id>/",CustomerDetailAPIView.as_view(),name="admin-customer-detail",),
    path("customers/<int:id>/update/",CustomerUpdateAPIView.as_view(),name="admin-customer-update",),

    # Contracts Management
    path("contracts/get/", AdminContractsListAPIView.as_view(), name="admin-contracts-list"),
    path("contracts/<str:contract_id>/get/", AdminContractDetailAPIView.as_view(), name="admin-contract-detail"),

    #<----------------------Table_Theme ---------------------------->
    path('tabletheme/create/',TableThemeCreateAPIView.as_view(), name = 'Table_Theme-create'),
    path('tabletheme/get-list/',TableThemeListAPIView.as_view(), name = 'Table_Theme-get-list'),
    path('tabletheme/<int:id>/get/',TableThemeDetailAPIView.as_view(), name = 'Table_Theme-get-detail'),
    path('tabletheme/<int:id>/update/',TableThemeUpdateAPIView.as_view(), name = 'Table_Theme-update'),
    # path('tabletheme/delete/',TableThemeDeleteAPIView.as_view(), name = 'Table_Theme-delete'),
    path(
        'tabletheme/delete/<int:pk>/',
        TableThemeDeleteAPIView.as_view(),
        name='table-theme-delete-single'
    ),
    path("unit-price/list/",UnitPriceListAPIView.as_view(),name="unite-price-list"),
    path("unit-price/export/",UnitPriceExportAPIView.as_view(),name="unit-price-export"),


    #<-------------------Dashboardes------------------------------->
    path("admindesh/",AdminDashAPIView.as_view(),name="admin-dash-info"),
    path("admindesh/mark-alerts-reviewed/", MarkAlertsReviewedAPIView.as_view(), name="mark-alerts-reviewed"),
    path("reports-analytics/", ReportsAnalyticsAPIView.as_view(), name="reports-analytics"),
    path("reports-analytics/export/", ExportReportsAnalyticsAPIView.as_view(), name="reports-analytics-export"),

    #<-------------------Homepage------------------------------->
    path("uniform-home/", HomePageAPIView.as_view(), name="home-page"),
    #<----------------------QuotationStatus--------------------->
    path("quotationstatus/admin/",QuotationStatusUpdateAPIView.as_view(), name = "QuotationStatus-post"),

    # path('order/update/<str:order_id>/', AdminOrderUpdateAPIView.as_view(), name='admin-order-update'),
    path('refund/<int:refund_id>/', AdminRefundProcessAPIView.as_view(), name='admin-refund-process'),
    path('refund/',AdminOrderRefundAPI.as_view(),name='refund-process-order_id'),
    path("users/",UserDetailAPIView.as_view(),name="users-Detail"),  
    path("users/<int:id>/", UserByIdAPIView.as_view(),name="user-detail-by-id",),
    
    #<--------------OrderUpdate--------------------->
    path('order/update/<str:order_id>/', AdminOrderUpdateAPIView.as_view(), name='admin-order-status-update'),
    path('orderupdate/<str:order_id>/update/',AdminOderUpdateAPIView.as_view(),name='AdminOderUpdate'),
    path('orderlist/get/',AdminOrderListAPIView.as_view(),name='Oder_list'),
    path('orderdetail/<str:order_id>/get/',AdminOrderDetailAPIView.as_view(),name='order_Detail'),
    path('orderordercancel/<str:order_id>/post/',AdminOrderCancelAPIView.as_view(),name='AdminOrderCancel-post'),
    
    #<--------------Compensation Invoice------------>
    path('order/<str:order_id>/compensation/preview/', CompensationInvoicePreviewAPIView.as_view(), name='compensation-invoice-preview'),
    path('order/<str:order_id>/compensation/generate/', CompensationInvoiceGenerateAPIView.as_view(), name='compensation-invoice-generate'),
    path('quotation-detail/<str:external_document_id>/get/', QuotationDetailByEnvelopeAPIView.as_view(), name='quotation-detail-by-envelope'),

    # ==========================================
    # INVENTORY WORKFLOW APIS 
    # ==========================================
    
    path('rental-order/items/', RentalListAPIView.as_view(), name='rental-order/items'),
    path('inventory/inspection-queue/', AdminInspectionQueueListAPIView.as_view(), name='admin-inspection-queue-list'),
    path('inventory/inspection-queue/<int:pk>/process/', AdminProcessInspectionAPIView.as_view(), name='admin-process-inspection'),
    
    path('inventory/damaged-items/', AdminDamagedItemListAPIView.as_view(), name='admin-damaged-items-list'),
    path('inventory/damaged-items/<int:pk>/update/', AdminUpdateDamagedItemAPIView.as_view(), name='admin-update-damaged-item'),
    
    path('inventory/cleaning-items/', AdminCleaningItemListAPIView.as_view(), name='admin-cleaning-items-list'),
    path('inventory/cleaning-items/create/', AdminCreateCleaningItemAPIView.as_view(), name='admin-create-cleaning-item'),
    path('inventory/cleaning-items/<int:pk>/update/', AdminUpdateCleaningItemAPIView.as_view(), name='admin-update-cleaning-item'),

    # ==========================================
    # PRICING & PACKAGES
    # ==========================================
    path('pricing-packages/', PricingPackageListCreateAPIView.as_view(), name='pricing-packages-list-create'),
    path('pricing-packages/<int:pk>/', PricingPackageDetailAPIView.as_view(), name='pricing-packages-detail'),
    path('pricing-rules/', PricingRuleListCreateAPIView.as_view(), name='pricing-rules-list-create'),
    path('pricing-rules/<int:pk>/', PricingRuleDetailAPIView.as_view(), name='pricing-rules-detail'),
    
    path('settings/rental-policy/', RentalPolicySettingsRetrieveView.as_view(), name='rental-policy-get'),
    path('settings/rental-policy/update/', RentalPolicySettingsUpdateView.as_view(), name='rental-policy-update'),
    
    
    # Menu URLs
    path('menu/create/', MenuCreateView.as_view(), name='menu-create'),
    path('menu/list/', MenuListView.as_view(), name='menu-list'),
    path('menu/<int:pk>/', MenuDetailView.as_view(), name='menu-detail'),
    path('menu/update/<int:pk>/', MenuUpdateView.as_view(), name='menu-update'),
    path('menu/delete/<int:pk>/', MenuDeleteView.as_view(), name='menu-delete'),

    # SubMenu URLs
    path('submenu/create/', SubMenuCreateView.as_view(), name='submenu-create'),
    path('submenu/list/', SubMenuListView.as_view(), name='submenu-list'),
    path('submenu/<int:pk>/', SubMenuDetailView.as_view(), name='submenu-detail'),
    path('submenu/update/<int:pk>/', SubMenuUpdateView.as_view(), name='submenu-update'),
    path('submenu/delete/<int:pk>/', SubMenuDeleteView.as_view(), name='submenu-delete'),

    # Permission URLs
    path('role-permissions/assign/', RolePermissionAssignView.as_view(), name='role-permissions-assign'),
    path('role-permissions/update/', SaveUpdateRolePermissionView.as_view(), name='role-permissions-update'),
    path('role-permissions/list/', RolePermissionListView.as_view(), name='role-permissions-list'),
    path('my-permissions/', UserMenuPermissionView.as_view(), name='my-permissions'),
    
    
    # ==========================================
    # SYSTEM SETTINGS
    # ==========================================
    path('settings/system/', SystemSettingsRetrieveView.as_view(), name='system-settings-get'),
    path('settings/system/update/', SystemSettingsUpdateView.as_view(), name='system-settings-update'),
    
    
    path("validate-promocode/",ValidatePromocodeAPIView.as_view(),name="validate-promocode",),

    
    # ==========================================
    # AI & AUTOMATION
    # ==========================================
    path('ai/faq-assistant/', FAQAssistantAPIView.as_view(), name='ai-faq-assistant'),
    path('ai/order-lookup/', OrderLookupAPIView.as_view(), name='ai-order-lookup'),
    path('ai/product-search/', ProductSearchAPIView.as_view(), name='ai-product-search'),
    path('ai/draft-generator/', DraftGeneratorAPIView.as_view(), name='ai-draft-generator'),

    # ==========================================
    # SIMULATION ASSETS MANAGEMENT
    # ==========================================
    path('simulation/structure/', SimulationStructureAPIView.as_view(), name='simulation-structure'),
    path('simulation/structure/save/', SimulationStructureAPIView.as_view(), name='simulation-structure-save'),
    path('product/toggle-simulation/', ProductSimulationVisibilityAPIView.as_view(), name='product-toggle-simulation'),
    path('simulation/options/', SimulationOptionsAPIView.as_view(), name='simulation-options'),
    path('simulation/categories/', SimulationCategoryListAPIView.as_view(), name='simulation-categories'),
]

