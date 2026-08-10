"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  FiEdit2,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { apiGetBlogList, apiDeleteBlog } from "@/services/BlogService";
import AddEditBlogModal from "./AddEditBlogModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import Pagination from "@/components/ui/Pagination";

const trimText = (text, wordLimit = 10) => {
  if (!text) return "";
  const words = text.split(" ");
  return words.length > wordLimit
    ? `${words.slice(0, wordLimit).join(" ")}...`
    : text;
};

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const BlogTab = () => {
  const t = useTranslations("contentMedia.blog");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [editPost, setEditPost] = useState(null);

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pageSize, setPageSize] = useState(8);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 8,
    total_pages: 1,
    total_items: 0,
  });

  /* ---------- FETCH ---------- */
  const fetchBlogs = useCallback(
    async (page = 1) => {
      if (!accessToken) return;

      try {
        setLoading(true);
        const response = await apiGetBlogList(accessToken, page, pageSize);

        if (response?.status && response?.data) {
          setPosts(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          } else {
            setPagination((prev) => ({
              ...prev,
              total_items:
                response.count || response.total_items || response.data.length,
              total_pages: response.total_pages || 1,
              page: response.page || page,
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    fetchBlogs(currentPage);
  }, [fetchBlogs, currentPage, pageSize]);

  /* ---------- DELETE ---------- */
  const handleDeleteConfirm = async () => {
    if (!postToDelete || !accessToken) return;

    try {
      setDeleteLoading(true);
      const response = await apiDeleteBlog(accessToken, postToDelete.id);

      toast.push(
        <Notification title={t("successTitle")} type="success">
          {response?.message}
        </Notification>,
      );
      setDeleteDialogOpen(false);
      setPostToDelete(null);
      fetchBlogs(currentPage);
    } catch (error) {
      console.error("Failed to delete blog:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ---------- HANDLERS ---------- */
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditPost(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    fetchBlogs(currentPage);
  };

  /* ---------- FILTER ---------- */
  const filteredPosts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter(
      (post) =>
        post.title?.toLowerCase().includes(term) ||
        post.categoryName?.toLowerCase().includes(term),
    );
  }, [posts, search]);

  /* ---------- PAGINATION ---------- */
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.total_pages) {
      setCurrentPage(page);
    }
  };

  /* ---------- SKELETON ---------- */
  const CardSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse"
        >
          <div className="p-3">
            <div className="rounded-xl bg-gray-200 w-full h-[200px]" />
          </div>
          <div className="px-5 pb-6 space-y-3">
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="bg-[#F4F7FC] rounded-xl shadow md:p-6 p-3">
        <div className="flex justify-between sm:flex-row flex-col items-start gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-semibold text-[#1C2C56]">{t("title")}</h2>
            <p className="text-base text-[#486284]">{t("subtitle")}</p>
          </div>

          <div className="flex gap-3">
            <button className="border border-[#CBD5E1] text-[#1C2C56] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
              {t("arrangeOrder")}
            </button>

            <button
              className="bg-[#1C4FA8] text-[#FFFFFF] px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
              onClick={() => {
                setEditPost(null);
                setOpenModal(true);
              }}
            >
              <FiPlus size={16} />
              {t("addNew")}
            </button>
          </div>
        </div>

        <div className="relative w-full md:w-80 mb-6">
          <FiSearch
            className="absolute left-3 top-2.5 text-[#64748B]"
            size={16}
          />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#00345F] rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1C2C56]"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        {loading ? (
          <CardSkeleton />
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 text-[#94A3B8]">
            {t("noData")}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col h-full"
              >
                <div className="p-3">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="rounded-xl object-cover w-full h-[200px]"
                  />
                </div>

                <div className="px-5 pb-6 flex flex-col flex-1">
                  <p className="text-xs text-gray-500 mb-2">
                    {formatDate(post.created_at)} &nbsp;&nbsp;{" "}
                    {post.categoryName}
                  </p>

                  <h3 className="font-semibold text-[#1C2C56] text-base mb-2 leading-snug">
                    {trimText(post.title, 10)}
                  </h3>

                  <p className="text-sm text-gray-600 leading-relaxed">
                    {trimText(post.description, 15)}
                  </p>

                  <div className="flex justify-end gap-2 mt-auto pt-4">
                    <button
                      type="button"
                      className="text-[#1C2C56] hover:text-[#0F172A] p-1.5 rounded hover:bg-[#EEF2FF]"
                      onClick={() => {
                        setEditPost(post);
                        setOpenModal(true);
                      }}
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50"
                      onClick={() => {
                        setPostToDelete(post);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-5">
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            total={pagination.total_items}
            onChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Modals */}
      <AddEditBlogModal
        isOpen={openModal}
        onClose={handleCloseModal}
        mode={editPost ? "edit" : "add"}
        initialData={editPost}
        onSaveSuccess={handleSaveSuccess}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setPostToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={t("deleteDialog.title")}
        message={t("deleteDialog.message")}
        itemName={postToDelete?.title}
        loading={deleteLoading}
      />
    </>
  );
};

export default BlogTab;
