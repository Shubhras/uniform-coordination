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

const AddProduct = () => {
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
  const validateForm = () => {
    const newErrors = {};

    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is required*";
    }

    if (!category) {
      newErrors.category = "Category is required*";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required*";
    }

    if (!fabric) {
      newErrors.fabric = "Fabric is required*";
    }

    if (!color) {
      newErrors.color = "Color is required*";
    }

    if (!formData.size.trim()) {
      newErrors.size = "Table size is required*";
    }

    if (!formData.rentalPricePerDay) {
      newErrors.rentalPricePerDay = "Rental price is required*";
    }

    if (!formData.total_quantity) {
      newErrors.total_quantity = "Stock quantity is required*";
    }

    if (!formData.productImage && !previewImage) {
      newErrors.productImage = "Product image is required*";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

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

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const response = await apiGetColorsList(accessToken, 1);

        if (response?.status && response?.data) {
          setColorList(response.data);
        }
      } catch (error) {
        console.log("Color List Error:", error);
      }
    };

    if (accessToken) {
      fetchColors();
    }
  }, [accessToken]);

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
      payload.append("table_shape", formData.tableShape);
      payload.append("style", formData.style);
      payload.append("fabric", fabric?.value);
      payload.append("color", color?.value);
      payload.append("size", formData.size);
      payload.append("rfid_tracking_enabled", formData.rfidTrackingEnabled);
      payload.append("price", formData.rentalPricePerDay);
      payload.append("rental_price_per_day", formData.rentalPricePerDay);
      payload.append("total_quantity", formData.total_quantity);
      payload.append("available_quantity", formData.total_quantity);
      payload.append("isActive", formData.isActive);

      if (formData.productImage) {
        payload.append("ProductImage_file", formData.productImage);
      }

      // if (isEdit) {
      //   await apiUpdateProduct(accessToken, productId, payload, "uniform");
      // } else {
      //   await apiCreateProduct(accessToken, payload);
      // }

      // router.push("/inventory-management");
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
            tableShape: data.table_shape || "round",
            style: data.style || "premium",
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

          setCategory({
            value: data.category?.id,
            label: data.category?.categoryName,
          });

          setFabric({
            value: data.fabric_details?.id,
            label: data.fabric_details?.name,
          });

          setColor({
            value: data.color_details?.id,
            label: data.color_details?.name,
          });
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
          {isEdit ? "Edit Product" : "Add Product"}
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
            Product Information
          </h2>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              Product Name
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
              placeholder="Enter product name"
              className="w-full h-12 rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 outline-none focus:border-[#A85A32]"
            />
            {errors.productName && (
              <p className="text-red-500 text-sm mt-1">{errors.productName}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              Category
            </label>

            <Select
              value={category}
              onChange={(value) => {
                setCategory(value);

                setErrors((prev) => ({
                  ...prev,
                  category: "",
                }));
              }}
              options={categoryOptions}
              styles={selectStyles}
              placeholder="Select Category"
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
            Short Description
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
            placeholder="Write product description..."
            className="w-full rounded-2xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 py-3 outline-none resize-none focus:border-[#A85A32]"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              Table Shape
            </label>

            <div className="relative">
              <select className="w-full h-12 rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 appearance-none outline-none focus:border-[#A85A32]">
                <option>Round</option>
                <option>Rectangle</option>
                <option>Square</option>
                <option>Oval</option>
              </select>

              <FiChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8D7A6C]"
                size={18}
              />
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              Style
            </label>

            <div className="relative">
              <select className="w-full h-12 rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 appearance-none outline-none focus:border-[#A85A32]">
                <option>Premium</option>
                <option>Classic</option>
                <option>Luxury</option>
                <option>Modern</option>
              </select>

              <FiChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8D7A6C]"
                size={18}
              />
            </div>
          </div>

          {/* Fabric */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              Fabric
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
              placeholder="Select Fabric"
              isSearchable={false}
            />
            {errors.fabric && (
              <p className="text-red-500 text-sm mt-1">{errors.fabric}</p>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              Color
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
              placeholder="Select Color"
              isSearchable={false}
            />
            {errors.color && (
              <p className="text-red-500 text-sm mt-1">{errors.color}</p>
            )}
          </div>

          {/* Table Size */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              Table Size
            </label>

            <div className="relative">
              <input
                type="number"
                value={formData.size}
                onChange={(e) => {
                  handleChange("size", e.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    size: "",
                  }));
                }}
                placeholder="Ex-72 Inch"
                className="w-full h-12 rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 pr-10 outline-none focus:border-[#A85A32]"
              />
              {errors.size && (
                <p className="text-red-500 text-sm mt-1">{errors.size}</p>
              )}
            </div>
          </div>

          {/* Rental Price */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              Rental Price / Day*
            </label>

            <input
              type="number"
              value={formData.rentalPricePerDay}
              onChange={(e) => {
                handleChange("rentalPricePerDay", e.target.value);

                setErrors((prev) => ({
                  ...prev,
                  rentalPricePerDay: "",
                }));
              }}
              placeholder="Ex-250"
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
              Stock Quantity
            </label>
            <input
              type="number"
              value={formData.total_quantity}
              onChange={(e) => {
                handleChange("total_quantity", e.target.value);

                setErrors((prev) => ({
                  ...prev,
                  total_quantity: "",
                }));
              }}
              placeholder="Ex-250"
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
                RFID Tracking
              </h3>

              <p className="text-[13px] text-[#9B8A7A] mt-1">
                Enable asset tracking via RFID tags
              </p>
            </div>

            <Switcher
              checked={formData.rfidTrackingEnabled}
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
            Product Image
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
            Upload image
          </h3>

          <p className="text-[13px] text-[#9E8D80] mt-1">
            PNG or JPG up to 5 MB
          </p>

          <label className="mt-5 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];

                handleChange("productImage", file);

                if (file) {
                  setPreviewImage(URL.createObjectURL(file));
                }

                setErrors((prev) => ({
                  ...prev,
                  productImage: "",
                }));
              }}
            />

            <span className="px-5 py-2 border border-[#D7A07B] rounded-full text-[#A85A32] text-sm font-medium hover:bg-[#FFF4ED] transition">
              Browse Files
            </span>
          </label>
        </div>
        {previewImage && (
          <div className="mt-5">
            <img
              src={previewImage}
              alt="Preview"
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
          Cancel
        </button>

        <Button
          type="button"
          onClick={handleSave}
          loading={saving}
          className="h-10 px-5 rounded-xl bg-[#A85A32] text-white font-medium hover:bg-[#8F4D2A] transition"
        >
          {isEdit ? "Save Changes" : "Publish Product"}
        </Button>
      </div>
    </div>
  );
};

export default AddProduct;
