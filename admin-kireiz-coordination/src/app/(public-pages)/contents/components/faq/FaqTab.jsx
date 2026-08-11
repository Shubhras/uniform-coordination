"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { FiEdit2, FiMinus, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetFaqList, apiDeleteFaq } from "@/services/FaqService";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import AddEditFaqModal from "./AddEditFaqModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

const FaqTab = () => {
  const t = useTranslations("contentMedia.faq");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openFaqId, setOpenFaqId] = useState(null);

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [editFaq, setEditFaq] = useState(null);

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ---------- FETCH ---------- */
  const fetchFaqs = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const response = await apiGetFaqList(accessToken, 1, 100);

      if (response?.status && response?.data) {
        setFaqs(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  /* ---------- DELETE ---------- */
  const handleDeleteConfirm = async () => {
    if (!faqToDelete || !accessToken) return;

    try {
      setDeleteLoading(true);
      const response = await apiDeleteFaq(accessToken, faqToDelete.id);

      toast.push(
        <Notification title={t("successTitle")} type="success">
          {response?.message}
        </Notification>
      );
      setDeleteDialogOpen(false);
      setFaqToDelete(null);
      fetchFaqs();
    } catch (error) {
      console.error("Failed to delete FAQ:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ---------- HANDLERS ---------- */
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditFaq(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    fetchFaqs();
  };

  /* ---------- FILTER ---------- */
  const filteredFaqs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return faqs;
    return faqs.filter((faq) => faq.title?.toLowerCase().includes(term));
  }, [faqs, search]);

  /* ---------- SKELETON ---------- */
  const FaqSkeleton = () => (
    <div className="max-w-5xl mx-auto space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl px-6 py-5 bg-[#F5F7FB] animate-pulse"
        >
          <div className="h-5 bg-gray-200 rounded w-3/4" />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-xl shadow md:p-6 p-3">
        <div className="flex justify-between sm:flex-row flex-col items-start gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-semibold text-[#1C2C56]">
              {t("title")}
            </h2>
            <p className="text-base text-[#486284]">{t("subtitle")}</p>
          </div>

          <button
            className="bg-[#1C4FA8] text-[#FFFFFF] px-4 py-2 rounded-md text-sm fw-500 flex items-center gap-2"
            onClick={() => {
              setEditFaq(null);
              setOpenModal(true);
            }}
          >
            <FiPlus size={16} />
            {t("addNew")}
          </button>
        </div>

        {loading ? (
          <FaqSkeleton />
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-16 text-[#94A3B8]">{t("noData")}</div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-4">
            <p className="text-center text-[#1C2C56] md:text-2xl text-xl">
              {t("sectionHeading")}
            </p>

            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              // Combine all descriptions into a single answer text
              const answerText =
                faq.descriptions?.map((d) => d.description).join("\n\n") || "";

              return (
                <div
                  key={faq.id}
                  className={`rounded-xl px-6 py-5 transition-all duration-300 ${
                    isOpen ? "bg-white shadow-md" : "bg-[#F5F7FB]"
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-left gap-4">
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="flex-1 flex items-center justify-between text-left gap-4"
                    >
                      <span className="text-[#1C2C56] font-medium text-sm md:text-base">
                        {faq.title}
                      </span>

                      <span className="text-[#1C2C56] text-xl">
                        {isOpen ? <FiMinus /> : <FiPlus />}
                      </span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="text-[#1C2C56] hover:text-[#0F172A] p-1.5 rounded hover:bg-[#EEF2FF]"
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditFaq(faq);
                          setOpenModal(true);
                        }}
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50"
                        onClick={(event) => {
                          event.stopPropagation();
                          setFaqToDelete(faq);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {isOpen && answerText && (
                    <div className="mt-4 space-y-2">
                      {faq.descriptions?.map((d, idx) => (
                        <p
                          key={d.id || idx}
                          className="text-sm text-gray-600 leading-relaxed"
                        >
                          {d.description}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddEditFaqModal
        isOpen={openModal}
        onClose={handleCloseModal}
        mode={editFaq ? "edit" : "add"}
        initialData={editFaq}
        onSaveSuccess={handleSaveSuccess}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setFaqToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={t("deleteDialog.title")}
        message={t("deleteDialog.message")}
        itemName={faqToDelete?.title}
        loading={deleteLoading}
      />
    </>
  );
};

export default FaqTab;
