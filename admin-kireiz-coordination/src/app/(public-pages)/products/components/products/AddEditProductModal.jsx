"use client";

import { useEffect, useRef, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormItem } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import { FiUpload, FiCheckCircle } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiCreateProduct, apiUpdateProduct } from "@/services/ProductService";
import {
  apiGetCategoryList,
  apiGetSubcategoryList,
} from "@/services/CategoryService";
import { apiGetPartsList } from "@/services/PartsService";

const productTypeOptions = [
  { value: "uniform", label: "Uniform" },
  { value: "table", label: "Table" },
];

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "42px",
    borderRadius: "8px",
    borderColor: state.isFocused ? "#1C2C56" : "#CBD5E1",
    boxShadow: "none",
    "&:hover": { borderColor: "#1C2C56" },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#1C2C56"
      : state.isFocused
        ? "#EEF2FF"
        : "white",
    color: state.isSelected ? "white" : "#1C2C56",
    fontSize: "14px",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#EEF2FF",
    borderRadius: "6px",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#1C2C56",
    fontSize: "13px",
    fontWeight: 500,
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#1C2C56",
    "&:hover": {
      backgroundColor: "#1C2C56",
      color: "white",
    },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const validationSchema = z.object({
  productName: z.string().trim().min(1, "Product name is required"),

  description: z.string().trim().min(1, "Description is required"),

  category: z
    .object({
      value: z.any(),
      label: z.string(),
    })
    .nullable()
    .refine((val) => val !== null, {
      message: "Category is required",
    }),

  subcategory: z
    .object({
      value: z.any(),
      label: z.string(),
    })
    .nullable()
    .refine((val) => val !== null, {
      message: "Subcategory is required",
    }),

  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(Number(val)), {
      message: "Enter valid price",
    }),

  productType: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .nullable()
    .refine((val) => val !== null, {
      message: "Product type is required",
    }),

  selectedParts: z.array(z.any()).min(1, "Parts is required"),

  image: z.any().optional(),
});

const AddEditProductModal = ({
  isOpen,
  onClose,
  initialData,
  onSaveSuccess,
}) => {
  const fileRef = useRef(null);
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const isEdit = Boolean(initialData);

  // Form fields
  // const [productName, setProductName] = useState("");
  // const [description, setDescription] = useState("");
  // const [price, setPrice] = useState("");
  // const [category, setCategory] = useState(null);
  // const [subcategory, setSubcategory] = useState(null);
  // const [selectedParts, setSelectedParts] = useState([]);
  // const [productType, setProductType] = useState(productTypeOptions[0]);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageValidated, setImageValidated] = useState(false);

  // Dynamic options from API
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [partOptions, setPartOptions] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [loadingParts, setLoadingParts] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      productName: "",
      description: "",
      category: null,
      subcategory: null,
      price: "",
      productType: productTypeOptions[0],
      selectedParts: [],
      image: null,
    },
  });

  // Save state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ---------- FETCH OPTIONS ---------- */
  useEffect(() => {
    if (!isOpen || !accessToken) return;

    // Fetch categories
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await apiGetCategoryList(accessToken);
        if (response?.status && response?.data) {
          const options = response.data.map((c) => ({
            value: c.id,
            label: c.categoryName,
          }));
          setCategoryOptions(options);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    // Fetch subcategories
    const fetchSubcategories = async () => {
      setLoadingSubcategories(true);
      try {
        const response = await apiGetSubcategoryList(accessToken);
        if (response?.status && response?.data) {
          const options = response.data.map((s) => ({
            value: s.id,
            label: s.name,
          }));
          setSubcategoryOptions(options);
        }
      } catch (err) {
        console.error("Failed to load subcategories:", err);
      } finally {
        setLoadingSubcategories(false);
      }
    };

    // Fetch parts
    const fetchParts = async () => {
      setLoadingParts(true);
      try {
        const response = await apiGetPartsList(accessToken, 1, 100);
        if (response?.status && response?.data) {
          const options = response.data
            .filter((p) => !p.isDeleted)
            .map((p) => ({
              value: p.id,
              label: p.partName,
            }));
          setPartOptions(options);
        }
      } catch (err) {
        console.error("Failed to load parts:", err);
      } finally {
        setLoadingParts(false);
      }
    };

    fetchCategories();
    fetchSubcategories();
    fetchParts();
  }, [isOpen, accessToken]);

  /* ---------- RESET / PREFILL ---------- */
  // useEffect(() => {
  //   if (!isOpen) return;

  //   if (isEdit && initialData) {
  //     setProductName(initialData.productName || "");
  //     setDescription(initialData.description || "");
  //     setPrice(initialData.price?.toString() || "");
  //     setImageFile(null);
  //     setPreview(initialData.ProductImage || null);
  //     setImageValidated(false);

  //     const typeMatch = productTypeOptions.find(
  //       (t) => t.value === initialData.productType,
  //     );
  //     setProductType(typeMatch || productTypeOptions[0]);

  //     if (initialData.category) {
  //       setCategory({
  //         value: initialData.category,
  //         label: `Category #${initialData.category}`,
  //       });
  //     } else {
  //       setCategory(null);
  //     }

  //     if (initialData.subcategory) {
  //       setSubcategory({
  //         value: initialData.subcategory,
  //         label: `Subcategory #${initialData.subcategory}`,
  //       });
  //     } else {
  //       setSubcategory(null);
  //     }

  //     if (initialData.parts && Array.isArray(initialData.parts)) {
  //       const preSelected = initialData.parts.map((pId) => ({
  //         value: pId,
  //         label: `Part #${pId}`,
  //       }));
  //       setSelectedParts(preSelected);
  //     } else {
  //       setSelectedParts([]);
  //     }
  //   } else {
  //     setProductName("");
  //     setDescription("");
  //     setPrice("");
  //     setCategory(null);
  //     setSubcategory(null);
  //     setSelectedParts([]);
  //     setProductType(productTypeOptions[0]);
  //     setImageFile(null);
  //     setPreview(null);
  //     setImageValidated(false);
  //   }
  //   setError("");
  // }, [isOpen, initialData]);

  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && initialData) {
      reset({
        productName: initialData.productName || "",
        description: initialData.description || "",
        price: initialData.price?.toString() || "",

        category: initialData.category
          ? {
              value: initialData.category,
              label: `Category #${initialData.category}`,
            }
          : null,

        subcategory: initialData.subcategory
          ? {
              value: initialData.subcategory,
              label: `Subcategory #${initialData.subcategory}`,
            }
          : null,

        selectedParts:
          initialData.parts?.map((id) => ({
            value: id,
            label: `Part #${id}`,
          })) || [],

        productType:
          productTypeOptions.find(
            (item) => item.value === initialData.productType,
          ) || productTypeOptions[0],
      });

      setPreview(initialData.ProductImage || null);
      setImageFile(null);
      setImageValidated(false);
    } else {
      reset();
      setPreview(null);
      setImageFile(null);
      setImageValidated(false);
    }
  }, [isOpen, initialData]);

  // Resolve labels once options load (edit mode)

  useEffect(() => {
    if (!isEdit || !initialData) return;

    if (categoryOptions.length) {
      const cat = categoryOptions.find(
        (x) => x.value === initialData.category?.id,
      );
      if (cat) {
        setValue("category", cat);
      }
    }

    if (subcategoryOptions.length) {
      const sub = subcategoryOptions.find(
        (x) => x.value === initialData.subcategory?.id,
      );
      if (sub) {
        setValue("subcategory", sub);
      }
    }

    if (partOptions.length) {
      const parts =
        initialData.parts?.map((id) => {
          return partOptions.find((p) => p.value === id);
        }) || [];

      setValue("selectedParts", parts);
    }
  }, [categoryOptions, subcategoryOptions, partOptions, initialData]);
  // useEffect(() => {
  //   if (!isEdit || !initialData) return;

  //   if (initialData.category && categoryOptions.length > 0) {
  //     const match = categoryOptions.find(
  //       (c) => c.value === initialData.category,
  //     );
  //     if (match) setCategory(match);
  //   }
  //   if (initialData.subcategory && subcategoryOptions.length > 0) {
  //     const match = subcategoryOptions.find(
  //       (s) => s.value === initialData.subcategory,
  //     );
  //     if (match) setSubcategory(match);
  //   }
  //   if (initialData.parts?.length > 0 && partOptions.length > 0) {
  //     const resolved = initialData.parts.map((pId) => {
  //       const match = partOptions.find((p) => p.value === pId);
  //       return match || { value: pId, label: `Part #${pId}` };
  //     });
  //     setSelectedParts(resolved);
  //   }
  // }, [categoryOptions, subcategoryOptions, partOptions, isEdit, initialData]);

  /* ---------- FILE HANDLER ---------- */
  const handleFile = (file) => {
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setImageValidated(true);
  };

  /* ---------- SAVE ---------- */
  const handleSave = async (values) => {
    setError("");
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("productName", values.productName.trim());
      formData.append("productType", values.productType.value);

      if (values.description.trim()) {
        formData.append("description", values.description.trim());
      }
      if (values.price) {
        formData.append("price", values.price);
      }
      if (values.category) {
        formData.append("category", values.category.value);
      }
      if (values.subcategory) {
        formData.append("subcategory", values.subcategory.value);
      }
      if (values.selectedParts.length > 0) {
        values.selectedParts.forEach((p) => {
          formData.append("parts", p.value);
        });
      }
      if (imageFile) {
        formData.append("productImage", imageFile);
      }

      if (isEdit && initialData?.id) {
        await apiUpdateProduct(
          accessToken,
          initialData.id,
          formData,
          values.productType.value,
        );
      } else {
        await apiCreateProduct(accessToken, formData);
      }

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err) {
      console.error("Product save error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to save product. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={onClose}
      className="w-full md:min-w-[600px]"
      contentClassName="!p-0 !h-auto"
    >
      <div className="flex flex-col">
        <div className="border-b px-6 py-4">
          <h2 className="text-2xl font-semibold text-[#1C2C56]">
            {isEdit ? "Edit Product" : "Add Product"}
          </h2>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Product Image */}
          <div>
            <label className="text-base font-medium text-[#1C2C56]">
              Product Image
            </label>

            <button
              onClick={() => fileRef.current.click()}
              className="mt-2 w-full bg-[#1C4FA8] text-white py-2 rounded-md text-sm flex items-center justify-center gap-2"
            >
              <FiUpload size={16} />
              Upload Image
            </button>

            <input
              type="file"
              ref={fileRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          {preview && (
            <div className="flex justify-center">
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg shadow"
              />
            </div>
          )}
          {imageValidated && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-600 font-medium">
              <FiCheckCircle className="text-green-600" size={16} />
              <span>Image validated successfully</span>
            </div>
          )}

          {/* Product Name */}
          {/* <div>
            <label className="text-base font-medium text-[#1C2C56]">
              Product Name<span className="text-red-500">*</span>
            </label>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
              placeholder="Eg:- School Uniform Set"
            />
          </div> */}
          <FormItem
            label="Product Name"
            invalid={!!errors.productName}
            errorMessage={errors.productName?.message}
          >
            <Controller
              name="productName"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Eg:- School Uniform Set" />
              )}
            />
          </FormItem>

          {/* Description */}
          <div>
            {/* <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
              placeholder="Product description..."
            /> */}
            <FormItem
              label="Description"
              invalid={!!errors.description}
              errorMessage={errors.description?.message}
            >
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    placeholder="Product description..."
                    className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                  />
                )}
              />
            </FormItem>
          </div>

          {/* Category (from API) */}
          {/* <div>
            <label className="text-base font-medium text-[#1C2C56]">
              Category
            </label>
            <Select
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              styles={selectStyles}
              placeholder="Select Category"
              isLoading={loadingCategories}
              loadingMessage={() => "Loading categories..."}
              noOptionsMessage={() => "No categories found"}
              isClearable
              menuPortalTarget={
                typeof document !== "undefined" ? document.body : null
              }
              menuPosition="fixed"
              className="mt-1"
            />
          </div> */}
          <FormItem
            label="Category"
            invalid={!!errors.category}
            errorMessage={errors.category?.message}
          >
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={categoryOptions}
                  styles={selectStyles}
                  onChange={field.onChange}
                />
              )}
            />
          </FormItem>

          {/* Subcategory (from API) */}
          {/* <div>
            <label className="text-base font-medium text-[#1C2C56]">
              Subcategory
            </label>
            <Select
              options={subcategoryOptions}
              value={subcategory}
              onChange={setSubcategory}
              styles={selectStyles}
              placeholder="Select Subcategory"
              isLoading={loadingSubcategories}
              loadingMessage={() => "Loading subcategories..."}
              noOptionsMessage={() => "No subcategories found"}
              isClearable
              menuPortalTarget={
                typeof document !== "undefined" ? document.body : null
              }
              menuPosition="fixed"
              className="mt-1"
            />
          </div> */}

          <FormItem
            label="Subcategory"
            invalid={!!errors.subcategory}
            errorMessage={errors.subcategory?.message}
          >
            <Controller
              name="subcategory"
              control={control}
              render={({ field }) => (
                <Select
                  options={subcategoryOptions}
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  styles={selectStyles}
                  placeholder="Select Subcategory"
                  isLoading={loadingSubcategories}
                  isClearable
                  menuPortalTarget={
                    typeof document !== "undefined" ? document.body : null
                  }
                  menuPosition="fixed"
                />
              )}
            />
          </FormItem>

          {/* Parts (multi-select from API) */}
          <div>
            {/* <Select
              isMulti
              options={partOptions}
              value={selectedParts}
              onChange={setSelectedParts}
              styles={selectStyles}
              placeholder="Select Parts..."
              isLoading={loadingParts}
              loadingMessage={() => "Loading parts..."}
              noOptionsMessage={() => "No parts found"}
              closeMenuOnSelect={false}
              menuPortalTarget={
                typeof document !== "undefined" ? document.body : null
              }
              menuPosition="fixed"
              className="mt-1"
            /> */}
            <FormItem
              label="Parts"
              invalid={!!errors.selectedParts}
              errorMessage={errors.selectedParts?.message}
            >
              <Controller
                name="selectedParts"
                control={control}
                render={({ field }) => (
                  <Select
                    isMulti
                    {...field}
                    options={partOptions}
                    styles={selectStyles}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormItem>
          </div>

          {/* Price */}
          {/* <div>
            <label className="text-base font-medium text-[#1C2C56]">
              Price
            </label>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
              placeholder="e.g. 100"
            />
          </div> */}
          <FormItem
            label="Price"
            invalid={!!errors.price}
            errorMessage={errors.price?.message}
          >
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <Input {...field} type="number" placeholder="100" />
              )}
            />
          </FormItem>

          {/* Product Type */}
          {/* <div>
            <label className="text-base font-medium text-[#1C2C56]">
              Product Type
            </label>
            <Select
              options={productTypeOptions}
              value={productType}
              onChange={setProductType}
              styles={selectStyles}
              menuPortalTarget={
                typeof document !== "undefined" ? document.body : null
              }
              menuPosition="fixed"
              className="mt-1"
            />
          </div> */}
          <FormItem
            label="Product Type"
            invalid={!!errors.productType}
            errorMessage={errors.productType?.message}
          >
            <Controller
              name="productType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={productTypeOptions}
                  styles={selectStyles}
                  onChange={field.onChange}
                />
              )}
            />
          </FormItem>
        </div>

        <div className="border-t px-6 py-4 flex justify-end sm:flex-row flex-col gap-3">
          <Button
            variant="plain"
            onClick={onClose}
            size="sm"
            disabled={saving}
            className="bg-blue-100 rounded-md"
          >
            Cancel
          </Button>
          <Button variant="plain" size="sm" className="bg-blue-100 rounded-lg">
            Save & Add Another
          </Button>
          <Button
            variant="solid"
            size="sm"
            className="bg-[#1C4FA8] px-6 hover:bg-[#163F86] text-white py-2 rounded-md"
            // onClick={handleSave}
            onClick={handleSubmit(handleSave)}
            loading={saving}
          >
            {isEdit ? "Update" : "Save"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default AddEditProductModal;
