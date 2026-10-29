"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import Pagination from "@/components/ui/Pagination";
import {
  apiGetAttributeOptions,
  apiDeleteAttributeOption,
} from "@/services/AttributeOptionService";
import AddEditSizeModal from "./AddEditSizeModal";

/*
 * The size run customers pick from in the simulation.
 *
 * Sizes are stored in AttributeOption under attribute="size". That table is general enough
 * to hold collar styles, cuffs and the rest, but only sizes are managed from the admin —
 * the other attributes keep the artwork bundled in the storefront. Handing another
 * attribute to the admin later means showing it here, not a migration.
 */

const ATTRIBUTE = "size";

const notify = (title, type, message) =>
  toast.push(
    <Notification title={title} type={type}>
      {message}
    </Notification>,
  );

const SizeTab = () => {
  const t = useTranslations("productSpecification.sizes");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total_pages: 1,
    total_items: 0,
  });

  const load = useCallback(
    async (page = 1) => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await apiGetAttributeOptions(accessToken, {
          attribute: ATTRIBUTE,
          page,
          pageSize,
        });
        if (res?.status) {
          setSizes(res.data || []);
          if (res.pagination) {
            setPagination(res.pagination);
          } else if (res.count !== undefined) {
            setPagination({
              page,
              page_size: pageSize,
              total_pages: Math.ceil(res.count / pageSize) || 1,
              total_items: res.count,
            });
          }
        }
      } catch (error) {
        console.error("Failed to load sizes:", error);
        notify(t("errorTitle"), "danger", t("loadFailed"));
      } finally {
        setLoading(false);
      }
    },
    [accessToken, t, pageSize],
  );

  useEffect(() => {
    load(currentPage);
  }, [load, currentPage, pageSize]);

  const handleDelete = async (size) => {
    if (!accessToken) return;
    try {
      setDeletingId(size.id);
      const res = await apiDeleteAttributeOption(accessToken, size.id);
      if (res?.status) {
        notify("Success", "success", t("deleted"));
        load(currentPage);
      } else {
        notify(t("errorTitle"), "danger", res?.message || t("deleteFailed"));
      }
    } catch (error) {
      console.error("Failed to delete size:", error);
      notify(t("errorTitle"), "danger", t("deleteFailed"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[#1C2C56]">{t("title")}</h2>
          <p className="text-sm text-[#64748B] mt-1">{t("subtitle")}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="bg-[#1C4FA8] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-[#163F86] transition-colors"
        >
          <FiPlus size={16} />
          {t("addSize")}
        </button>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-base">
          <thead className="bg-[#1C4FA80F] text-[#486284]">
            <tr>
              <th className="text-left px-5 py-4 font-medium">{t("colSize")}</th>
              <th className="text-left px-5 py-4 font-medium">{t("colCategory")}</th>
              <th className="text-left px-5 py-4 font-medium">{t("colOrder")}</th>
              <th className="text-left px-5 py-4 font-medium">{t("colStatus")}</th>
              <th className="text-left px-5 py-4 font-medium">{t("colAction")}</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              [0, 1, 2].map((i) => (
                <tr key={i} className="border-t border-[#F1F5F9]">
                  <td colSpan={5} className="px-4 py-4">
                    <div className="h-5 bg-[#F1F5F9] rounded animate-pulse" />
                  </td>
                </tr>
              ))}

            {!loading && sizes.length === 0 && (
              <tr className="border-t border-[#F1F5F9]">
                <td colSpan={5} className="px-4 py-10 text-center">
                  <p className="text-sm font-medium text-[#1C2C56]">{t("empty")}</p>
                  <p className="text-xs text-[#64748B] mt-1">{t("emptyHint")}</p>
                </td>
              </tr>
            )}

            {!loading &&
              sizes.map((size) => (
                <tr key={size.id} className="border-t border-[#F1F5F9]">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center min-w-[52px] px-3 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] font-semibold text-[#1C2C56]">
                      {size.name}
                    </span>
                  </td>
                  <td className="px-5 py-4 ">
                    {size.categoryName || t("allCategories")}
                  </td>
                  <td className="px-5 py-4 ">{size.order}</td>
                  <td className="px-5 py-4 ">
                    <span
                      className={`text-xs px-5 py-2 rounded-full ${size.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      {size.isActive ? t("active") : t("inactive")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(size);
                          setModalOpen(true);
                        }}
                        className="p-2 rounded-md bg-[#EEF2FF] text-[#1C2C56] hover:bg-[#E0E7FF] transition-colors"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(size)}
                        disabled={deletingId === size.id}
                        className="p-2 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

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

      <AddEditSizeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editing}
        onSaveSuccess={() => {
          setModalOpen(false);
          load(currentPage);
        }}
      />
    </div>
  );
};

export default SizeTab;
