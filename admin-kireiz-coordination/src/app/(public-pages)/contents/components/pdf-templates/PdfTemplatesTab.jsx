"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FiGrid, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import {
  apiGetPdfTemplateList,
  apiReorderPdfTemplates,
  apiDeletePdfTemplate,
} from "@/services/PdfTemplateService";

const notify = (title, type, message) =>
  toast.push(
    <Notification title={title} type={type}>
      {message}
    </Notification>,
  );

const PdfTemplatesTab = () => {
  const router = useRouter();
  const t = useTranslations("contentMedia.pdfTemplates");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchTemplates = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiGetPdfTemplateList(accessToken);
      if (res?.status) {
        setTemplates(res.data || []);
      }
    } catch (error) {
      console.error("Failed to load PDF templates:", error);
      notify(t("errorTitle"), "danger", t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [accessToken, t]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    const items = Array.from(templates);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    // Optimistic reorder so the drag feels instant; rolled back if the save fails.
    const previous = templates;
    setTemplates(items);

    try {
      const res = await apiReorderPdfTemplates(
        accessToken,
        items.map((t) => t.id),
      );
      if (!res?.status) throw new Error(res?.message || "Reorder failed");
    } catch (error) {
      console.error("Failed to save template order:", error);
      setTemplates(previous);
      notify(t("errorTitle"), "danger", t("reorderFailed"));
    }
  };

  const handleDelete = async (template) => {
    if (deletingId) return;

    try {
      setDeletingId(template.id);
      const res = await apiDeletePdfTemplate(accessToken, template.id);
      if (res?.status) {
        notify(
          t("successTitle"),
          "success",
          t("deleteSuccess", { name: template.name }),
        );
        await fetchTemplates();
      }
    } catch (error) {
      console.error("Failed to delete template:", error);
      notify(t("errorTitle"), "danger", t("deleteFailed"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-[#F4F7FC] rounded-xl shadow md:p-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#1C2C56]">
            {t("title")}
          </h2>
          <p className="text-base text-[#486284]">{t("subtitle")}</p>
        </div>

        <button
          onClick={() => router.push("/contents/add-template")}
          className="bg-[#1C4FA8] text-[#FFFFFF] px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
        >
          <FiPlus size={16} />
          {t("addNew")}
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#E2E8F0] rounded-lg px-5 py-4 animate-pulse"
            >
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-3 w-56 bg-gray-100 rounded mt-2" />
            </div>
          ))}
        </div>
      )}

      {!loading && templates.length === 0 && (
        <div className="bg-white border border-dashed border-[#CBD5E1] rounded-lg py-12 text-center">
          <p className="text-base font-medium text-[#1C2C56]">{t("noData")}</p>
          <p className="text-sm text-[#64748B] mt-1">{t("noDataSubtitle")}</p>
        </div>
      )}

      {/* Drag & Drop List */}
      {!loading && templates.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="pdfTemplates">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-3"
              >
                {templates.map((template, index) => (
                  <Draggable
                    key={template.id}
                    draggableId={String(template.id)}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-white border border-[#E2E8F0] rounded-lg px-5 py-4 shadow-sm hover:shadow-md transition flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          {/* Drag Handle */}
                          <span
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing"
                          >
                            <FiGrid className="text-[#94A3B8]" size={18} />
                          </span>

                          <div>
                            <p className="text-base font-semibold text-[#1C2C56]">
                              {template.name}
                            </p>
                            <p className="text-sm text-[#64748B]">
                              {template.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            title={t("editTemplateTooltip")}
                            className="text-[#1C2C56] hover:text-[#0F172A]"
                            onClick={() =>
                              router.push(
                                `/contents/add-template?id=${template.id}`,
                              )
                            }
                          >
                            <FiEdit2 size={18} />
                          </button>

                          <button
                            title={t("deleteTemplateTooltip")}
                            disabled={deletingId === template.id}
                            className="text-[#94A3B8] hover:text-red-500 disabled:opacity-40"
                            onClick={() => handleDelete(template)}
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default PdfTemplatesTab;
