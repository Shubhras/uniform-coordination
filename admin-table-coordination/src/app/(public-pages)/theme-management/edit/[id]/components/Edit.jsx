"use client";

import Select from "react-select";
import {
  FiBarChart2,
  FiArrowLeft,
  FiChevronRight,
  FiChevronDown,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiLayers,
  FiX,
} from "react-icons/fi";
import { LuGripVertical } from "react-icons/lu";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { apiUpdateTheme, apiGetThemeDetails } from "@/services/ThemeManagement";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import Notification from "@/components/ui/Notification";
import toast from "@/components/ui/toast";
import InventoryItemsModal from "../../../addTheme/components/InventoryItemsModal";

const categoryOptions = [
  { value: "Wedding", label: "Wedding" },
  { value: "Corporate", label: "Corporate" },
  { value: "Birthday", label: "Birthday" },
];

const Edit = () => {
  const router = useRouter();
  const { id } = useParams();
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  const [coverImages, setCoverImages] = useState([]);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Theme name is required*";
    }

    if (!category) {
      newErrors.category = "Category is required*";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required*";
    }

    if (!thumbnailPreview && !thumbnail) {
      newErrors.thumbnail = "Thumbnail is required*";
    }

    const hasItem = sections.some(
      (section) => section.items && section.items.length > 0,
    );

    if (!hasItem) {
      newErrors.sections =
        "At least one product must be added in any one section.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateTheme = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      const formData = new FormData();

      formData.append("title", title);
      formData.append("category_id", category.value);
      formData.append("description", description);
      const sectionMap = {
        1: "table_setup",
        2: "floral_decor",
        3: "seating",
        4: "additional_elements",
      };

      const themeItems = [];

      sections.forEach((section) => {
        section.items.forEach((item) => {
          themeItems.push({
            product_id: item.product_details?.id,
            section: sectionMap[section.id],
          });
        });
      });

      formData.append("theme_items", JSON.stringify(themeItems));

      if (thumbnail) {
        formData.append("image", thumbnail);
      }

      const res = await apiUpdateTheme(accessToken, id, formData);

      if (res?.status) {
        toast.push(
          <Notification title="Success" type="success">
            {res.message}
          </Notification>,
        );

        router.push("/theme-management");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveItem = (sectionId, itemId) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;

        const updatedItems = section.items.filter((item) => item.id !== itemId);

        return {
          ...section,
          items: updatedItems,
          count: updatedItems.length,
        };
      }),
    );
  };

  const handleAddItem = (product) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== selectedSectionId) return section;

        // Duplicate product check
        const exists = section.items.some(
          (item) => item.product_details?.id === product.id,
        );

        if (exists) {
          return section;
        }

        const newItem = {
          id: `new-${product.id}-${Date.now()}`,
          product_details: product,
        };

        return {
          ...section,
          items: [...section.items, newItem],
          count: section.items.length + 1,
        };
      }),
    );

    setShowInventoryModal(false);
  };
  const [category, setCategory] = useState(categoryOptions[0]);

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "48px",
      borderColor: "#E7D9CF",
      boxShadow: "none",
      borderRadius: "12px",
      "&:hover": {
        borderColor: "#A0522D",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const [sections, setSections] = useState([
    {
      id: 1,
      title: "Table Setup",
      count: 0,
      open: false,
      items: [],
    },
    {
      id: 2,
      title: "Floral & Decor",
      count: 0,
      open: false,
      items: [],
    },
    {
      id: 3,
      title: "Seating",
      count: 0,
      open: false,
      items: [],
    },
    {
      id: 4,
      title: "Additional Elements",
      count: 0,
      open: false,
      items: [],
    },
  ]);

  const toggleSection = (id) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, open: !section.open } : section,
      ),
    );
  };

  useEffect(() => {
    const fetchThemeDetails = async () => {
      try {
        const res = await apiGetThemeDetails(accessToken, id);

        if (res?.status) {
          const data = res.data;

          setTitle(data.title);
          setDescription(data.description);

          setCategory({
            value: data.category,
            label: data.category_name,
          });

          setThumbnailPreview(data.image);
          setCoverImages(data.cover_images || []);
          const items = data.theme_items || {};

          setSections([
            {
              id: 1,
              title: "Table Setup",
              count: items.table_setup?.length || 0,
              open: false,
              items: items.table_setup || [],
            },
            {
              id: 2,
              title: "Floral & Decor",
              count: items.floral_decor?.length || 0,
              open: false,
              items: items.floral_decor || [],
            },
            {
              id: 3,
              title: "Seating",
              count: items.seating?.length || 0,
              open: false,
              items: items.seating || [],
            },
            {
              id: 4,
              title: "Additional Elements",
              count: items.additional_elements?.length || 0,
              open: false,
              items: items.additional_elements || [],
            },
          ]);
        }
      } catch (err) {
        console.log(err);
      }
    };

    if (accessToken && id) {
      fetchThemeDetails();
    }
  }, [accessToken, id]);

  return (
    <>
      <div className="bg-[#FAF8F6] min-h-screen p-6">
        {/* Header */}

        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full border border-[#E7D9CF] bg-white flex items-center justify-center hover:bg-[#F8F4F1]"
          >
            <FiArrowLeft size={18} className="text-[#1A1410]" />
          </button>

          <h1 className="text-[28px] font-bold text-[#1A1410]">Edit Theme</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#EFE5DD] p-6">
          {/* Section Heading */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#FEF3EC] flex items-center justify-center">
              <FiBarChart2 size={18} className="text-[#A0522D]" />
            </div>

            <h2 className="text-[20px] font-bold text-[#2C1A0E]">
              Basic Information
            </h2>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-[13px] font-bold uppercase tracking-wider text-[#8C6E5D] mb-2 block">
                Theme Name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    title: "",
                  }));
                }}
                placeholder="Enter theme name"
                className="w-full h-12 rounded-xl border border-[#E7D9CF] px-4 outline-none focus:border-[#A0522D]"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="text-[13px] font-bold uppercase tracking-wider text-[#8C6E5D] mb-2 block">
                Category
              </label>

              <Select
                instanceId="theme-category"
                inputId="theme-category"
                options={categoryOptions}
                value={category}
                onChange={(value) => {
                  setCategory(value);

                  setErrors((prev) => ({
                    ...prev,
                    category: "",
                  }));
                }}
                styles={selectStyles}
              />
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-5">
            <label className="text-[13px] font-bold uppercase tracking-wider text-[#8C6E5D] mb-2 block">
              Short Description
            </label>

            <textarea
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);

                setErrors((prev) => ({
                  ...prev,
                  description: "",
                }));
              }}
              placeholder="Write short description..."
              className="w-full rounded-xl border border-[#E7D9CF] p-4 resize-none outline-none focus:border-[#A0522D]"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Theme Images */}
        <div className="mt-6 bg-white rounded-2xl border border-[#EFE5DD] p-6">
          {/* Heading */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#FEF3EC] flex items-center justify-center">
              <FiLayers size={18} className="text-[#A0522D]" />
            </div>

            <h2 className="text-[20px] font-bold text-[#2C1A0E]">
              Theme Images
            </h2>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-[13px] font-bold uppercase tracking-wider text-[#8C6E5D] mb-3">
              Thumbnail
            </label>

            <div className="overflow-hidden rounded-xl border border-[#EFE5DD] h-[230px]">
              <img
                src={thumbnailPreview || "/placeholder.png"}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          {errors.thumbnail && (
            <p className="text-red-500 text-sm mt-2">{errors.thumbnail}</p>
          )}

          {/* Gallery */}
          <div className="mt-6">
            <label className="block text-[13px] font-bold uppercase tracking-wider text-[#8C6E5D] mb-3">
              Gallery Photos
            </label>

            <div className="flex gap-4 flex-wrap">
              {coverImages.map((img) => (
                <div
                  key={img.id}
                  className="relative w-[105px] h-[105px] rounded-xl overflow-hidden border border-[#EFE5DD]"
                >
                  <img
                    src={img.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />

                  <button className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow">
                    <FiX size={10} />
                  </button>
                </div>
              ))}

              {/* Upload */}
              <button className="w-[105px] h-[105px] rounded-xl border-2 border-dashed border-[#E5D5C8] flex items-center justify-center hover:bg-[#FAF5F2] transition">
                <FiPlus className="text-[#A0522D]" size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EFE5DD] shadow-sm p-6 mt-5">
          {/* Heading */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#FEF3EC] flex items-center justify-center">
              <FiLayers size={18} className="text-[#A0522D]" />
            </div>
            <h1 className="text-[20px] font-bold text-[#1A1410]">
              Theme Builder
            </h1>
          </div>
          <div className="space-y-5">
            {sections.map((section) => (
              <div
                key={section.id}
                className="bg-white border border-[#EFE5DD] rounded-2xl overflow-hidden"
              >
                <div className="flex justify-between items-center px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleSection(section.id)}>
                      {section.open ? (
                        <FiChevronDown className="text-[#A0522D]" />
                      ) : (
                        <FiChevronRight className="text-[#A0522D]" />
                      )}
                    </button>

                    <div className="w-[4px] h-5 bg-[#A0522D]" />

                    <h3 className="font-bold text-[#1C1917] text-[17px]">
                      {section.title}
                    </h3>

                    <span className="px-2 py-1 rounded-full bg-[#FDF1EA] text-[#A85A32] text-[13px] font-semibold">
                      {section.count} items
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSectionId(section.id);
                      setShowInventoryModal(true);
                    }}
                    className="flex items-center gap-2 border border-[#E8D8CC] rounded-lg px-4 py-2 text-[#A85A32] text-[14px] bg-[#FAF5F2]"
                  >
                    <FiPlus size={14} />
                    Add Item
                  </button>
                </div>

                {section.open && (
                  <div className="border-t border-[#F2ECE8]">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="relative w-full max-w-xs">
                          <input
                            type="text"
                            placeholder="Search themes by name..."
                            className="w-full h-10 rounded-lg border border-[#E8DDD4] pl-10 pr-4 text-sm outline-none focus:border-[#A85A32]"
                          />

                          <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            width="15"
                            height="15"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="7" cy="7" r="5" />
                            <path d="M11 11l3 3" />
                          </svg>
                        </div>
                        {/* 
                            <select className="h-10 rounded-lg border border-[#E8DDD4] px-4 text-sm outline-none">
                              <option>Categories</option>
                              <option>Tableware</option>
                              <option>Furniture</option>
                              <option>Decor</option>
                            </select> */}
                      </div>
                    </div>

                    {/* Items */}

                    <div className="px-5 pb-5 space-y-3">
                      {section.items.length > 0 ? (
                        section.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-xl border border-[#EFE5DD] px-5 py-4"
                          >
                            {/* Left */}

                            <div className="flex items-center gap-4">
                              <div className="cursor-grab text-[#C5B7AA]">
                                <LuGripVertical size={16} />
                              </div>

                              <img
                                src={item.product_details?.ProductImage}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                alt=""
                              />

                              {/* Fixed width */}
                              <div className="w-64">
                                <h4 className="font-semibold text-[#A08070] text-sm break-words">
                                  {item.product_details?.productName}
                                </h4>

                                <p className="text-xs text-[#8C6E5D]">
                                  ₹ {item.product_details?.price}
                                </p>
                              </div>
                            </div>
                            {/* Right */}

                            <div className="flex items-center gap-6">
                              <button className="flex items-center gap-1 text-[#0088FF] text-sm">
                                <FiRefreshCw size={14} strokeWidth={1.8} />
                                Replace
                              </button>

                              <button
                                onClick={() =>
                                  handleRemoveItem(section.id, item.id)
                                }
                                className="flex items-center gap-1 text-[#EB5757] text-sm"
                              >
                                <FiTrash2 size={14} strokeWidth={1.8} />
                                Remove
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center py-10 text-sm text-[#8C6E5D] border border-dashed border-[#E8D8CC] rounded-xl bg-[#FAF8F6]">
                          No items found.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-10">
          <button
            // onClick={onBack}
            className="px-8 py-2.5 rounded-xl border border-[#E5D5C8] text-[#8C6E5D] font-medium hover:bg-[#FAF5F2]"
          >
            Back
          </button>

          <Button
            onClick={handleUpdateTheme}
            loading={saving}
            disabled={saving}
            className="px-6 py-1 rounded-xl bg-[#A85A32] text-white font-semibold hover:bg-[#8E4727]"
          >
            Update Theme
          </Button>
        </div>
      </div>
      <InventoryItemsModal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
        onAdd={handleAddItem}
      />
    </>
  );
};

export default Edit;
