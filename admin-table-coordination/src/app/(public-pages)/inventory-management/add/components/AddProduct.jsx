"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { useRouter, useSearchParams } from "next/navigation";
import Switcher from "@/components/ui/Switcher";
import {
  FiArrowLeft,
  FiChevronDown,
  FiBarChart2,
  FiLayers,
  FiImage,
} from "react-icons/fi";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import Select from "react-select";
import { apiGetFabricList } from "@/services/FabricService";
import { apiGetCategoryList } from "@/services/CategoryService";
import { apiGetColorsList } from "@/services/ColorsService";
import {
  apiCreateProduct,
  apiUpdateProduct,
  apiGetProductDetails,
} from "@/services/ProductService";
import {
  TableShapesService,
  StylesService,
  SizesService,
} from "@/services/AttributeService";
import { useTranslations } from "next-intl";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

const AddProduct = () => {
  const t = useTranslations("inventoryManagement.addProduct");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const [fabricList, setFabricList] = useState([]);
  const [fabric, setFabric] = useState(null);
  const fabricOptions = fabricList.map((item) => ({
    value: item.id,
    label: item.fabricName,
  }));
  const [categoryList, setCategoryList] = useState([]);
  const [category, setCategory] = useState(null);
  const categoryOptions = categoryList.map((item) => ({
    value: item.id,
    label: item.categoryName,
  }));

  const [colorList, setColorList] = useState([]);
  const [color, setColor] = useState(null);
  const [errors, setErrors] = useState({});
  const [tableShapeList, setTableShapeList] = useState([]);
  const [styleList, setStyleList] = useState([]);
  const [sizeList, setSizeList] = useState([]);

  const [tableShape, setTableShape] = useState(null);
  const [style, setStyle] = useState(null);
  const [size, setSize] = useState(null);

  const tableShapeOptions = tableShapeList.map((item) => ({
    value: item.name,
    label: item.name,
  }));

  const styleOptions = styleList.map((item) => ({
    value: item.name,
    label: item.name,
  }));

  const sizeOptions = sizeList.map((item) => ({
    value: item.name,
    label: item.name,
  }));

  const colorOptions = colorList.map((item) => ({
    value: item.id,
    label: item.colorName,
  }));

  const isEdit = searchParams.get("mode") === "edit";
  const productId = searchParams.get("id");

  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    tableShape: "",
    style: "",
    size: "",
    price: "",
    rentalPricePerDay: "",
    total_quantity: "",
    availableQuantity: "",
    rfidTrackingEnabled: true,
    isActive: true,
    productImage: null,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategoryChange = (val) => {
    setCategory(val);
    setFabric(null);
    setColor(null);
    setTableShape(null);
    setStyle(null);
    setSize(null);
    setFormData((prev) => ({
      ...prev,
      tableShape: "",
      style: "",
      size: "",
    }));
    setErrors((prev) => ({
      ...prev,
      category: "",
      fabric: "",
      color: "",
      size: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productName.trim()) {
      newErrors.productName = t("validation.productNameRequired");
    }

    if (!category) {
      newErrors.category = t("validation.categoryRequired");
    }

    if (!formData.description.trim()) {
      newErrors.description = t("validation.descriptionRequired");
    }

    if (!fabric) {
      newErrors.fabric = t("validation.fabricRequired");
    }

    if (!color) {
      newErrors.color = t("validation.colorRequired");
    }

    const currentSize = size?.value || formData.size;
    if (!String(currentSize || "").trim()) {
      newErrors.size = t("validation.sizeRequired");
    }

    if (!formData.rentalPricePerDay || !String(formData.rentalPricePerDay).trim()) {
      newErrors.rentalPricePerDay = t("validation.rentalPriceRequired");
    } else if (isNaN(Number(formData.rentalPricePerDay)) || Number(formData.rentalPricePerDay) <= 0) {
      newErrors.rentalPricePerDay = t("validation.rentalPriceGreaterThanZero");
    }

    if (!formData.total_quantity || !String(formData.total_quantity).trim()) {
      newErrors.total_quantity = t("validation.quantityRequired");
    } else if (isNaN(Number(formData.total_quantity)) || Number(formData.total_quantity) <= 0) {
      newErrors.total_quantity = t("validation.quantityGreaterThanZero");
    }

    if (!formData.productImage && !previewImage) {
      newErrors.productImage = t("validation.imageRequired");
    } else if (
      formData.productImage &&
      formData.productImage.size > MAX_IMAGE_SIZE
    ) {
      newErrors.productImage = t("validation.imageSizeLimit");
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

<<<<<<< HEAD
  const colorOptions = colorList.map((item) => ({
    value: item.id,
    label: item.colorName,
  }));

  const isEdit = searchParams.get("mode") === "edit";
  const productId = searchParams.get("id");

  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    tableShape: "round",
    style: "premium",
    size: "",
    price: "",
    rentalPricePerDay: "",
    total_quantity: "",
    availableQuantity: "",
    rfidTrackingEnabled: true,
    isActive: true,
    productImage: null,
  });
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      const errorMsg = t("validation.imageSizeLimit");
      handleChange("productImage", null);
      setPreviewImage("");
      e.target.value = "";
      setErrors((prev) => ({
        ...prev,
        productImage: errorMsg,
      }));
      toast.push(
        <Notification title="Error" type="danger" duration={2500}>
          {errorMsg}
        </Notification>,
      );
      return;
    }

    handleChange("productImage", file);
    setPreviewImage(URL.createObjectURL(file));
    setErrors((prev) => ({
      ...prev,
      productImage: "",
    }));
  };

  useEffect(() => {
    const fetchFabricList = async () => {
      try {
        const response = await apiGetFabricList(accessToken);

        console.log(response);

        if (response?.status && response?.data) {
          setFabricList(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (accessToken) {
      fetchFabricList();
    }
  }, [accessToken]);

=======
  // Fetch all categories once
>>>>>>> 604e42cb70e4c97d6eef77851651f0d6803e6725
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiGetCategoryList(accessToken, 1, 100);

        if (response?.status && response?.data) {
          setCategoryList(response.data);
        }
      } catch (error) {
        console.log("Category List Error:", error);
      }
    };

    if (accessToken) {
      fetchCategories();
    }
  }, [accessToken]);

  // Fetch Fabric, Color, TableShape, Style, and Size dynamically filtered by selected category
  useEffect(() => {
    if (!accessToken) return;

    const categoryId = category?.value ? String(category.value) : "";
    if (!categoryId) {
      setFabricList([]);
      setColorList([]);
      setTableShapeList([]);
      setStyleList([]);
      setSizeList([]);
      return;
    }

    const fetchCategoryDependentData = async () => {
      try {
        const [fabRes, colRes, shapeRes, styleRes, sizeRes] = await Promise.all([
          apiGetFabricList(accessToken, 1, 100, "", categoryId),
          apiGetColorsList(accessToken, 1, 100, "", categoryId),
          TableShapesService.list(accessToken, 1, 100, "", categoryId),
          StylesService.list(accessToken, 1, 100, "", categoryId),
          SizesService.list(accessToken, 1, 100, "", categoryId),
        ]);

        if (fabRes?.status && fabRes?.data) setFabricList(fabRes.data);
        else setFabricList([]);

        if (colRes?.status && colRes?.data) setColorList(colRes.data);
        else setColorList([]);

        if (shapeRes?.status && shapeRes?.data) setTableShapeList(shapeRes.data);
        else setTableShapeList([]);

        if (styleRes?.status && styleRes?.data) setStyleList(styleRes.data);
        else setStyleList([]);

        if (sizeRes?.status && sizeRes?.data) setSizeList(sizeRes.data);
        else setSizeList([]);
      } catch (error) {
        console.error("Error fetching category-dependent attributes:", error);
      }
    };

    fetchCategoryDependentData();
  }, [accessToken, category?.value]);

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "48px",
      height: "48px",
      borderColor: "#E9DDD3",
      borderRadius: "12px",
      backgroundColor: "#FCFAF8",
      boxShadow: "none",
      cursor: "pointer",
      "&:hover": {
        borderColor: "#A85A32",
      },
    }),

    valueContainer: (base) => ({
      ...base,
      height: "48px",
      padding: "0 12px",
    }),

    indicatorSeparator: () => ({
      display: "none",
    }),

    dropdownIndicator: (base) => ({
      ...base,
      color: "#8D7A6C",
      "&:hover": {
        color: "#8D7A6C",
      },
    }),

    placeholder: (base) => ({
      ...base,
      color: "#8D7A6C",
    }),

    singleValue: (base) => ({
      ...base,
      color: "#2C1A0E",
    }),

    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#A85A32"
        : state.isFocused
          ? "#F8F2ED"
          : "#fff",
      color: state.isSelected ? "#fff" : "#444",
      cursor: "pointer",
    }),
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = new FormData();

      payload.append("productName", formData.productName);
      payload.append("description", formData.description);
      payload.append("category_id", category?.value);
      payload.append("table_shape", tableShape?.value || formData.tableShape || "");
      payload.append("style", style?.value || formData.style || "");
      payload.append("fabric", fabric?.value);
      payload.append("color", color?.value);
      payload.append("size", size?.value || formData.size || "");
      payload.append("rfid_tracking_enabled", formData.rfidTrackingEnabled);
      payload.append("price", formData.rentalPricePerDay);
      payload.append("rental_price_per_day", formData.rentalPricePerDay);
      payload.append("total_quantity", formData.total_quantity);
      if (!isEdit) {
        payload.append("available_quantity", formData.total_quantity);
      }
      payload.append("isActive", formData.isActive);

      if (formData.productImage) {
        payload.append("ProductImage_file", formData.productImage);
      }

      if (isEdit) {
        const res = await apiUpdateProduct(
          accessToken,
          productId,
          payload,
          "uniform",
        );

        toast.push(
          <Notification title="Success" type="success" duration={2500}>
            {res?.message || "Product updated successfully"}
          </Notification>,
        );
      } else {
        const res = await apiCreateProduct(accessToken, payload);

        toast.push(
          <Notification title="Success" type="success" duration={2500}>
            {res?.message || "Product created successfully"}
          </Notification>,
        );
      }

      router.push("/inventory-management");
    } catch (err) {
      console.error("Save Error:", err);
    } finally {
      setSaving(false);
    }
  };
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await apiGetProductDetails(accessToken, productId);

        if (res?.status && res?.data) {
          const data = res.data;

          setFormData({
            productName: data.productName || "",
            description: data.description || "",
            tableShape: data.table_shape || "",
            style: data.style || "",
            size: data.size || "",
            price: data.price || "",
            rentalPricePerDay: data.rental_price_per_day || "",
            total_quantity: data.total_quantity || "",
            availableQuantity: data.available_quantity || "",
            rfidTrackingEnabled: data.rfid_tracking_enabled,
            isActive: data.isActive,
            productImage: null,
          });
          setPreviewImage(data.ProductImage || "");

          if (data.category) {
            setCategory({
              value: data.category?.id,
              label: data.category?.categoryName,
            });
          }

          if (data.fabric_details) {
            setFabric({
              value: data.fabric_details?.id,
              label: data.fabric_details?.name,
            });
          }

          if (data.color_details) {
            setColor({
              value: data.color_details?.id,
              label: data.color_details?.name,
            });
          }

          if (data.table_shape) {
            setTableShape({
              value: data.table_shape,
              label: data.table_shape,
            });
          }

          if (data.style) {
            setStyle({
              value: data.style,
              label: data.style,
            });
          }

          if (data.size) {
            setSize({
              value: data.size,
              label: data.size,
            });
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    if (accessToken && isEdit && productId) {
      fetchProductDetails();
    }
  }, [accessToken, isEdit, productId]);

  return (
    <div className="min-h-screen bg-[#FAF8F6] px-4 py-5">
      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full border border-[#E7D9CF] bg-white flex items-center justify-center hover:bg-[#F8F4F1]"
        >
          <FiArrowLeft size={18} className="text-[#1A1410]" />
        </button>

        <h1 className="text-[32px] font-semibold text-[#1A1410]">
          {isEdit ? t("editProduct") : t("addProduct")}
        </h1>
      </div>

      {/* Product Information Card */}
      <div className="bg-white border border-[#EFE5DD] rounded-3xl p-7">
        {/* Card Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-full bg-[#FDF4EE] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#FEF3EC] flex items-center justify-center">
              <FiBarChart2 size={18} className="text-[#A0522D]" />
            </div>
          </div>

          <h2 className="text-[20px] font-semibold text-[#2C1A0E]">
            {t("productInformation")}
          </h2>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              {t("productNAME")} <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              value={formData.productName}
              onChange={(e) => {
                handleChange("productName", e.target.value);

                setErrors((prev) => ({
                  ...prev,
                  productName: "",
                }));
              }}
              placeholder={t("productPlaceholder")}
              className="w-full h-12 rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 outline-none focus:border-[#A85A32]"
            />
            {errors.productName && (
              <p className="text-red-500 text-sm mt-1">{errors.productName}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              {t("category")} <span className="text-red-500">*</span>
            </label>

            <Select
              value={category}
              onChange={handleCategoryChange}
              options={categoryOptions}
              styles={selectStyles}
              placeholder={t("selectCategory")}
              isSearchable={false}
            />
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>
        </div>

        {/* Short Description */}
        <div className="mt-6">
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
            {t("shortDescription")} <span className="text-red-500">*</span>
          </label>

          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => {
              handleChange("description", e.target.value);

              setErrors((prev) => ({
                ...prev,
                description: "",
              }));
            }}
            placeholder={t("descriptionPlaceholder")}
            className="w-full rounded-2xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 py-3 outline-none resize-none focus:border-[#A85A32]"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Table Shape */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              {t("tableShape")}
            </label>
            <Select
              value={tableShape}
              onChange={(value) => {
                setTableShape(value);
                handleChange("tableShape", value?.value || "");
              }}
              options={tableShapeOptions}
              styles={selectStyles}
              placeholder={t("selectTableShape") || "Select Table Shape"}
              isSearchable={false}
              isDisabled={!category}
            />
            {!category && (
              <p className="text-xs text-[#8D7A6C] mt-1">{t("selectCategoryFirst") || "Please select a category first"}</p>
            )}
          </div>

          {/* Style */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              {t("style")}
            </label>
            <Select
              value={style}
              onChange={(value) => {
                setStyle(value);
                handleChange("style", value?.value || "");
              }}
              options={styleOptions}
              styles={selectStyles}
              placeholder={t("selectStyle") || "Select Style"}
              isSearchable={false}
              isDisabled={!category}
            />
            {!category && (
              <p className="text-xs text-[#8D7A6C] mt-1">{t("selectCategoryFirst") || "Please select a category first"}</p>
            )}
          </div>

          {/* Fabric */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              {t("fabric")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={fabric}
              onChange={(value) => {
                setFabric(value);

                setErrors((prev) => ({
                  ...prev,
                  fabric: "",
                }));
              }}
              options={fabricOptions}
              styles={selectStyles}
              placeholder={t("selectFabric")}
              isSearchable={false}
              isDisabled={!category}
            />
            {errors.fabric && (
              <p className="text-red-500 text-sm mt-1">{errors.fabric}</p>
            )}
            {!category && (
              <p className="text-xs text-[#8D7A6C] mt-1">{t("selectCategoryFirst") || "Please select a category first"}</p>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              {t("color")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={color}
              onChange={(value) => {
                setColor(value);

                setErrors((prev) => ({
                  ...prev,
                  color: "",
                }));
              }}
              options={colorOptions}
              styles={selectStyles}
              placeholder={t("selectColor")}
              isSearchable={false}
              isDisabled={!category}
            />
            {errors.color && (
              <p className="text-red-500 text-sm mt-1">{errors.color}</p>
            )}
            {!category && (
              <p className="text-xs text-[#8D7A6C] mt-1">{t("selectCategoryFirst") || "Please select a category first"}</p>
            )}
          </div>

          {/* Table Size */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              {t("tableSize")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={size}
              onChange={(value) => {
                setSize(value);
                handleChange("size", value?.value || "");
                setErrors((prev) => ({
                  ...prev,
                  size: "",
                }));
              }}
              options={sizeOptions}
              styles={selectStyles}
              placeholder={t("selectTableSize") || "Select Table Size"}
              isSearchable={false}
              isDisabled={!category}
            />
            {errors.size && (
              <p className="text-red-500 text-sm mt-1">{errors.size}</p>
            )}
            {!category && (
              <p className="text-xs text-[#8D7A6C] mt-1">{t("selectCategoryFirst") || "Please select a category first"}</p>
            )}
          </div>

          {/* Rental Price */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              {t("rentalPrice")} <span className="text-red-500">*</span>
            </label>

            <input
              type="number"
              value={formData.rentalPricePerDay}
              onChange={(e) => {
                const val = e.target.value;
                handleChange("rentalPricePerDay", val);

                let errorMsg = "";
                if (val !== "") {
                  if (isNaN(Number(val)) || Number(val) <= 0) {
                    errorMsg = t("validation.rentalPriceGreaterThanZero");
                  }
                }
                setErrors((prev) => ({
                  ...prev,
                  rentalPricePerDay: errorMsg,
                }));
              }}
              placeholder={t("pricePlaceholder")}
              className="w-full h-12 rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 outline-none focus:border-[#A85A32]"
            />
            {errors.rentalPricePerDay && (
              <p className="text-red-500 text-sm mt-1">
                {errors.rentalPricePerDay}
              </p>
            )}
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              {t("stockQuantity")} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.total_quantity}
              onChange={(e) => {
                const val = e.target.value;
                handleChange("total_quantity", val);

                let errorMsg = "";
                if (val !== "") {
                  if (isNaN(Number(val)) || Number(val) <= 0) {
                    errorMsg = t("validation.quantityGreaterThanZero");
                  }
                }
                setErrors((prev) => ({
                  ...prev,
                  total_quantity: errorMsg,
                }));
              }}
              placeholder={t("quantityPlaceholder")}
              className="w-full h-12 rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 outline-none focus:border-[#A85A32]"
            />
            {errors.total_quantity && (
              <p className="text-red-500 text-sm mt-1">
                {errors.total_quantity}
              </p>
            )}
            {/* <input
              type="number"
              placeholder="0"
              className="w-full h-12 rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 outline-none focus:border-[#A85A32]"
            /> */}
          </div>

          {/* RFID Tracking */}
          <div className="flex items-center justify-between border border-[#E9DDD3] rounded-xl bg-[#FCFAF8] px-5 py-4">
            <div>
              <h3 className="text-[16px] font-semibold text-[#1A1410]">
                {t("rfid")}
              </h3>

              <p className="text-[13px] text-[#9B8A7A] mt-1">
                {t("rfidContent")}
              </p>
            </div>

            <Switcher
              checked={formData.rfidTrackingEnabled}
              switcherClass="bg-[#A85A32]"
              onChange={(checked) =>
                handleChange("rfidTrackingEnabled", checked)
              }
            />
          </div>
        </div>
      </div>

      {/* Product Image */}
      <div className="bg-white border border-[#EFE5DD] rounded-3xl p-6 mb-6">
        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-[#FDF4EE] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#FEF3EC] flex items-center justify-center">
              <FiLayers size={18} className="text-[#A0522D]" />
            </div>
          </div>

          <h2 className="text-[20px] font-semibold text-[#1A1410]">
            {t("productImage")} <span className="text-red-500">*</span>
          </h2>
        </div>

        {/* Upload Box */}
        <div className="border border-dashed border-[#E7D6C9] rounded-2xl bg-[#FCFAF8] h-[220px] flex flex-col items-center justify-center">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-[#FDF4EE] flex items-center justify-center mb-4">
            <div className="w-8 h-8 rounded-full bg-[#FEF3EC] flex items-center justify-center">
              <FiImage size={18} className="text-[#A0522D]" />
            </div>
          </div>

          <h3 className="text-[16px] font-medium text-[#1A1410]">
            {t("uploadImage")}
          </h3>

          <p className="text-[13px] text-[#9E8D80] mt-1">{t("imageHint")}</p>

          <label className="mt-5 cursor-pointer">
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              onChange={handleImageChange}
            />

            <span className="px-5 py-2 border border-[#D7A07B] rounded-full text-[#A85A32] text-sm font-medium hover:bg-[#FFF4ED] transition">
              {t("browseFiles")}
            </span>
          </label>
        </div>
        {previewImage && (
          <div className="mt-5">
            <img
              src={previewImage}
              alt={t("imagePreview")}
              className="w-44 h-44 rounded-xl border object-cover"
            />
          </div>
        )}

        {errors.productImage && (
          <p className="text-red-500 text-sm mt-2">{errors.productImage}</p>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-4 mt-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="h-10 px-5 rounded-xl border border-[#E9DDD3] bg-white text-[#6E6258] font-medium hover:bg-[#F8F3EF] transition"
        >
          {t("cancel")}
        </button>

        <Button
          type="button"
          onClick={handleSave}
          loading={saving}
          className="h-10 px-5 rounded-xl bg-[#A85A32] text-white font-medium hover:bg-[#8F4D2A] transition"
        >
          {isEdit ? t("saveChanges") : t("publishProduct")}
        </Button>
      </div>
    </div>
  );
};

export default AddProduct;
