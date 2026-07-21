"use client";

import { useState, useEffect } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  FiSearch,
  FiPlus,
  FiX,
  FiEye,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import Select from "react-select";
import { useRouter } from "next/navigation";
import NewDeleteModal from "@/components/shared/NewDeleteModal";
import { apiGetThemeList } from "@/services/ThemeManagement";

const ThemePage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("list");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);

  const getThemeList = async () => {
    try {
      setLoading(true);

      const res = await apiGetThemeList(accessToken);
      console.log("API Response:", res);
      console.log("API Data:", res?.data?.data);

      if (res?.status) {
        setThemes(res.data || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  console.log("accessToken", accessToken);
  useEffect(() => {
    console.log("useEffect", accessToken);
    if (accessToken) {
      getThemeList();
    }
  }, [accessToken]);

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "Corporate", label: "Corporate" },
    { value: "Medical", label: "Medical" },
    { value: "Hotel", label: "Hotel" },
    { value: "Industrial", label: "Industrial" },
  ];

  const [category, setCategory] = useState(categoryOptions[0]);

  const handleDeleteClick = (item) => {
    // setFabricToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);

    // API yaha call hogi
    await new Promise((resolve) => setTimeout(resolve, 800));

    setDeleteLoading(false);
    setDeleteDialogOpen(false);
    // setFabricToDelete(null);
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "42px",
      borderColor: "#D1D5DB",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#1C4FA8",
      },
    }),

    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#A0522D"
        : state.isFocused
          ? "#EEF4FF"
          : "#fff",
      color: state.isSelected ? "#fff" : "#1F2937",
    }),
  };

  return (
    <>
      <div className="bg-white p-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h2 className="text-[28px] font-semibold text-[#1A1410]">
              Theme Management
            </h2>

            <p className="text-sm text-[#757575] mt-1">
              Manage decoration themes for your rental catalog
            </p>
          </div>

          <button
            onClick={() => router.push("/theme-management/addTheme")}
            className="bg-[#A0522D] transition text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium"
          >
            <FiPlus />
            Add New Theme
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A85A32B2]"
              size={16}
            />

            <input
              type="text"
              placeholder="Search Theme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 border border-[#D1D5DB] text-[#A85A32B2] rounded-lg pl-10 pr-10 outline-none focus:border-[#1C4FA8]"
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <FiX className="text-gray-500" />
              </button>
            )}
          </div>

          {/* Category */}
          <div className="w-56">
            <Select
              value={category}
              onChange={setCategory}
              options={categoryOptions}
              styles={selectStyles}
            />
          </div>

          {/* View Toggle */}
          <div className="ml-auto flex border border-[#D1D5DB] rounded-lg overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`px-5 py-2 text-sm ${
                view === "grid"
                  ? "bg-[#A85A320A] text-[#A85A32B2] font-semibold"
                  : "bg-white text-[#A85A32B2] font-semibold"
              }`}
            >
              Grid
            </button>

            <button
              onClick={() => setView("list")}
              className={`px-5 py-2 text-sm ${
                view === "list"
                  ? "bg-[#A85A320A] text-[#A85A32B2] font-semibold"
                  : "bg-white text-[#A85A32B2] font-semibold"
              }`}
            >
              List
            </button>
          </div>
        </div>

        {view === "list" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F1F5F9] text-[#486284]">
                <tr className="bg-[#F7F2EE] text-[#6B7280] text-sm">
                  <th className="text-left px-4 py-3 font-medium">Theme</th>
                  <th className="text-left px-4 py-3 font-medium">Theme</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-center px-4 py-3 font-medium">
                    Items Included
                  </th>
                  <th className="text-center px-4 py-3 font-medium">Usage</th>
                  <th className="text-center px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {themes.map((theme) => {
                  const totalItems =
                    (theme.theme_items?.table_setup?.length || 0) +
                    (theme.theme_items?.floral_decor?.length || 0) +
                    (theme.theme_items?.seating?.length || 0) +
                    (theme.theme_items?.additional_elements?.length || 0);

                  return (
                    <tr
                      key={theme.id}
                      className="odd:bg-white even:bg-[#FBF8F6] hover:bg-[#F6F0EB]"
                    >
                      <td className="px-4 py-3">
                        <img
                          src={theme.image}
                          alt={theme.title}
                          className="w-[58px] h-[40px] rounded object-cover"
                        />
                      </td>

                      <td className="px-4 py-3 font-medium">{theme.title}</td>

                      <td className="px-4 py-3">{theme.category}</td>

                      <td className="px-4 py-3 text-center">{totalItems}</td>

                      <td className="px-4 py-3 text-center">-</td>

                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() =>
                              router.push(`/theme-management/view/${theme.id}`)
                            }
                          >
                            <FiEye />
                          </button>

                          <button
                            onClick={() =>
                              router.push(`/theme-management/edit/${theme.id}`)
                            }
                          >
                            <FiEdit2 />
                          </button>

                          <button onClick={() => handleDeleteClick(theme)}>
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {view === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {themes.map((theme) => {
              const totalItems =
                (theme.theme_items?.table_setup?.length || 0) +
                (theme.theme_items?.floral_decor?.length || 0) +
                (theme.theme_items?.seating?.length || 0) +
                (theme.theme_items?.additional_elements?.length || 0);

              return (
                <div
                  key={theme.id}
                  className="bg-white rounded-2xl border border-[#E8E2DC] overflow-hidden"
                >
                  <div className="h-40 overflow-hidden">
                    <img
                      src={theme.image}
                      alt={theme.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{theme.title}</h3>

                      <span className="text-xs bg-[#FFF3EC] px-2 py-1 rounded">
                        {theme.category}
                      </span>
                    </div>

                    <p className="text-sm mt-2 text-gray-500">
                      {theme.description}
                    </p>

                    <p className="mt-3 text-sm">Items: {totalItems}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <NewDeleteModal
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          // setFabricToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message="Deleting this theme will remove it from all over the platform. This action cannot be undone."
        // itemName={fabricToDelete?.productName}
        loading={deleteLoading}
      />
    </>
  );
};

export default ThemePage;
