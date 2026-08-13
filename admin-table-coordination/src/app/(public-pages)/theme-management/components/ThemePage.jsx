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
  FiRotateCcw,
} from "react-icons/fi";
import Select from "react-select";
import Spinner from "@/components/ui/Spinner";
import Pagination from "@/components/ui/Pagination";
import { useRouter } from "next/navigation";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import NewDeleteModal from "@/components/shared/NewDeleteModal";
import { apiGetThemeList, apiDeleteTheme } from "@/services/ThemeManagement";
import { apiGetCategoryList } from "@/services/CategoryService";
import { useTranslations } from "next-intl";

const ThemePage = () => {
  const router = useRouter();
  const t = useTranslations("themeManagement");
   const ts = useTranslations("successTitle");
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("list");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [themeToDelete, setThemeToDelete] = useState(null);
  const [categoryList, setCategoryList] = useState([]);
  const [category, setCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalItems, setTotalItems] = useState(0);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);

  const getThemeList = async (
    search = "",
    categoryId = "",
    page = currentPage,
  ) => {
    try {
      setLoading(true);

      const res = await apiGetThemeList(accessToken, {
        search,
        categoryId,
        ordering: "newest",
        page,
        pageSize,
      });

      if (res?.results?.status) {
        setThemes(res.results.data || []);
        setTotalItems(res.count || 0);
      } else {
        setThemes([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) return;

    getThemeList(
      debouncedSearch,
      category?.value === "all" ? "" : category?.value,
      currentPage,
    );
  }, [accessToken, debouncedSearch, category, currentPage]);

  const handleView = (theme) => {
    sessionStorage.setItem("selectedThemeId", theme.id);
    router.push("/theme-management/view");
  };

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categoryList.map((item) => ({
      value: item.id,
      label: item.categoryName,
    })),
  ];

  const handleReset = () => {
    setSearchQuery("");
    setCategory(null);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiGetCategoryList(accessToken, 1, 100);

        if (res?.status) {
          setCategoryList(res.data || []);
        }
      } catch (err) {
        console.log(err);
      }
    };

    if (accessToken) {
      fetchCategories();
    }
  }, [accessToken]);

  const handleDeleteClick = (item) => {
    setThemeToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!themeToDelete) return;

    try {
      setDeleteLoading(true);

      const res = await apiDeleteTheme(accessToken, themeToDelete.id);
      toast.push(
        <Notification title={ts("success")} type="success">
          {res.message}
        </Notification>,
      );

      if (res?.status) {
        setThemes((prev) =>
          prev.filter((item) => item.id !== themeToDelete.id),
        );

        setDeleteDialogOpen(false);
        setThemeToDelete(null);

        // ya agar latest list chahiye to
        // await getThemeList();
      }
    } catch (err) {
      console.log(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "40px",
      borderColor: "#EFE5DD",
      boxShadow: "none",
      borderRadius: "8px",
      "&:hover": {
        borderColor: "#C08457",
      },
    }),

    singleValue: (base) => ({
      ...base,
      color: "#A85A32B2",
    }),

    placeholder: (base) => ({
      ...base,
      color: "#A85A32B2",
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
          ? "#F8F2ED"
          : "#fff",
      color: state.isSelected ? "#fff" : "#444",
    }),
  };

  return (
    <>
      <div className="bg-white p-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h2 className="text-[28px] font-semibold text-[#1A1410]">
              {t("themeManage")}
            </h2>

            <p className="text-sm text-[#757575] mt-1">
              {t("themeContent")}
            </p>
          </div>

          <button
            onClick={() => router.push("/theme-management/addTheme")}
            className="bg-[#A0522D] transition text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
          >
            <FiPlus />
             {t("addNew")}
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
              placeholder={t("searchTheme")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 border border-[#D1D5DB] text-[#A85A32B2] rounded-lg pl-10 pr-10 outline-none focus:border-[#1C4FA8]"
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
          <button
            type="button"
            onClick={handleReset}
            className="flex h-10 items-center gap-2 rounded-lg border border-[#EFE5DD] bg-white px-4 text-sm font-medium text-[#C08457] transition hover:bg-[#FCF7F3]"
          >
            <FiRotateCcw size={14} />
             {t("reset")}
          </button>

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
               {t("grid")}
            </button>

            <button
              onClick={() => setView("list")}
              className={`px-5 py-2 text-sm ${
                view === "list"
                  ? "bg-[#A85A320A] text-[#A85A32B2] font-semibold"
                  : "bg-white text-[#A85A32B2] font-semibold"
              }`}
            >
               {t("list")}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Spinner size={40} customColorClass="text-[#A0522D]" />
          </div>
        ) : (
          <>
            {view === "list" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F1F5F9] text-[#486284]">
                    <tr className="bg-[#F7F2EE] text-[#6B7280] text-sm">
                      <th className="text-left px-4 py-3 font-medium"> {t("theme")}</th>
                      <th className="text-left px-4 py-3 font-medium">{t("name")}</th>
                      <th className="text-left px-4 py-3 font-medium">
                        {t("category")}
                      </th>
                      <th className="text-left px-4 py-3 font-medium">
                        {t("itemsIncluded")}
                      </th>
                      {/* <th className="text-left px-4 py-3 font-medium"> {t("usage")}</th> */}
                      <th className="text-left px-4 py-3 font-medium">
                         {t("actions")}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {themes.length > 0 ? (
                      themes.map((theme) => {
                        const totalItems =
                          (theme.theme_items?.table_setup?.length || 0) +
                          (theme.theme_items?.floral_decor?.length || 0) +
                          (theme.theme_items?.seating?.length || 0) +
                          (theme.theme_items?.additional_elements?.length || 0);

                        return (
                          <tr
                            key={theme.id}
                            className="odd:bg-white even:bg-[#FBF8F6]"
                          >
                            <td className="px-4 py-3">
                              <img
                                src={theme.image}
                                alt={theme.title}
                                className="w-[58px] h-[40px] rounded object-cover"
                              />
                            </td>

                            <td className="px-4 py-3 font-medium">
                              {theme.title}
                            </td>

                            <td className="px-4 py-3">{theme.category_name}</td>

                            <td className="px-4 py-3">{totalItems}</td>

                            {/* <td className="px-4 py-3"> {theme.usage || "-"}</td> */}

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-0">
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/theme-management/view/${theme.id}`,
                                    )
                                  }
                                  className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"

                                  // className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm border border-[#F1E8E2] transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"
                                >
                                  <FiEye size={17} />
                                </button>

                                <button
                                  onClick={() =>
                                    router.push(
                                      `/theme-management/edit/${theme.id}`,
                                    )
                                  }
                                  className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"

                                  // className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm border border-[#F1E8E2] transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"
                                >
                                  <FiEdit2 size={17} />
                                </button>

                                <button
                                  onClick={() => handleDeleteClick(theme)}
                                  // className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm border border-[#F1E8E2] transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"
                                  className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"
                                >
                                  <FiTrash2 size={17} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-10 text-center text-gray-500"
                        >
                          {t("notheme")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {view === "grid" &&
              (themes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {themes.map((theme) => {
                    const totalItems =
                      (theme.theme_items?.table_setup?.length || 0) +
                      (theme.theme_items?.floral_decor?.length || 0) +
                      (theme.theme_items?.seating?.length || 0) +
                      (theme.theme_items?.additional_elements?.length || 0);

                    return (
                      <div
                        key={theme.id}
                        className="bg-white rounded-2xl border border-[#ECE7E3] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                      >
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={theme.image}
                            alt={theme.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-[17px] text-[#2B2B2B] line-clamp-1">
                              {theme.title}
                            </h3>

                            <span className="shrink-0 rounded-full bg-[#FDF0E8] text-[#B56A42] text-[11px] font-medium px-3 py-1">
                              {theme.category_name}
                            </span>
                          </div>

                          <p className="mt-2 text-[13px] leading-5 text-[#8B8B8B] line-clamp-2 min-h-[40px]">
                            {theme.description || "No description available"}
                          </p>

                          {/* Footer Buttons */}
                          <div className="mt-2 flex items-center justify-between border-t border-[#F3F3F3] pt-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  router.push(
                                    `/theme-management/view/${theme.id}`,
                                  )
                                }
                                className="flex items-center gap-2 bg-[#A0522D] text-white text-xs px-4 py-2 rounded-full hover:bg-[#8b4322]"
                              >
                                <FiEye size={13} />
                                 {t("preview")}
                              </button>

                              <button
                                onClick={() =>
                                  router.push(
                                    `/theme-management/edit/${theme.id}`,
                                  )
                                }
                                className="flex items-center gap-2 border border-[#D8D8D8] text-[#444] text-xs px-4 py-2 rounded-full hover:bg-[#F8F8F8]"
                              >
                                <FiEdit2 size={13} />
                                 {t("edit")}
                              </button>
                            </div>

                            <button
                              onClick={() => handleDeleteClick(theme)}
                              className="w-9 h-9 rounded-full border border-[#E5E5E5] flex items-center justify-center hover:bg-red-50 hover:text-red-500"
                            >
                              <FiTrash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center text-gray-500 text-lg">
                  {t("notheme")}
                </div>
              ))}
          </>
        )}
      </div>

      <div
        className="flex justify-end mt-3"
        style={{ marginRight: "6px", marginLeft: "6px" }}
      >
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          total={totalItems || themes.length}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>

      <NewDeleteModal
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setThemeToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={t("deleteTheme")}
        message={t("deletethemeContent")}
        // itemName={fabricToDelete?.productName}
        loading={deleteLoading}
      />
    </>
  );
};

export default ThemePage;
