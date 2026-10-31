"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { FiPlus, FiCheckCircle, FiClock, FiFileText, FiEdit2 } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import Spinner from "@/components/ui/Spinner";
import { apiGetPrivacyPolicyList } from "@/services/PrivacyPolicyService";
import AddPolicyForm from "./AddPolicyForm";

const PrivacyPolicy = () => {
  const t = useTranslations("systemSettings.policyTab");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const sections = [
    {
      id: "privacy_and_policy",
      label: t("privacyPolicy") || "Privacy Policy",
    },
    {
      id: "terms_and_conditions",
      label: t("termsAndConditions") || "Terms and Conditions",
    },
    {
      id: "agreement",
      label: t("agreements") || "Agreements",
    },
  ];

  const [activeSection, setActiveSection] = useState("privacy_and_policy");
  const [loading, setLoading] = useState(false);
  const [policyList, setPolicyList] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);

  const currentSection = sections.find((s) => s.id === activeSection) || sections[0];

  const fetchPolicyList = useCallback(
    async (sectionType) => {
      try {
        setLoading(true);
        const res = await apiGetPrivacyPolicyList(accessToken, sectionType, "table");

        let items = [];
        if (Array.isArray(res?.data)) {
          items = res.data;
        } else if (Array.isArray(res?.data?.results)) {
          items = res.data.results;
        } else if (Array.isArray(res?.results)) {
          items = res.results;
        } else if (res?.data && typeof res.data === "object" && res.data.id) {
          items = [res.data];
        }

        setPolicyList(items);
      } catch (err) {
        console.error("Error fetching policy list:", err);
        setPolicyList([]);
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    if (accessToken) {
      fetchPolicyList(activeSection);
    }
  }, [accessToken, activeSection, fetchPolicyList]);

  return (
    <div className="mt-8 flex flex-col md:flex-row min-h-[500px]">
      {/* Left Sidebar Section */}
      <div className="w-full md:w-64 flex-shrink-0 md:border-r md:border-[#E2E8F0] pr-0 md:pr-6 pb-6 md:pb-0">
        <nav className="flex flex-col gap-1.5">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  setActiveSection(section.id);
                  setIsCreating(false);
                  setEditingPolicy(null);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${isActive
                  ? "bg-[#F1F4F9] text-[#111827] font-semibold"
                  : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAFC] font-medium"
                  }`}
              >
                {section.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 md:pl-8 pt-1">
        {isCreating ? (
          /* Inline Creation / Edit Component */
          <AddPolicyForm
            activeSection={activeSection}
            sectionTitle={currentSection.label}
            accessToken={accessToken}
            initialData={editingPolicy}
            onCancel={() => {
              setIsCreating(false);
              setEditingPolicy(null);
            }}
            onSuccess={() => {
              setIsCreating(false);
              setEditingPolicy(null);
              fetchPolicyList(activeSection);
            }}
          />
        ) : loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size={40} customColorClass="text-[#A0522D]" />
          </div>
        ) : !policyList || policyList.length === 0 ? (
          /* Empty State */
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-[#111827]">
                {t("noDataAvailable") || "No Data Available"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditingPolicy(null);
                  setIsCreating(true);
                }}
                className="bg-[#A0522D] transition text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-[#8B4513] cursor-pointer"
              >
                <FiPlus size={16} />
                {t("add") || "Add"}
              </button>
            </div>

            <p className="mt-4 text-sm text-[#94A3B8]">
              {t("noContentAvailable") || "No content available."}
            </p>
          </div>
        ) : (
          /* Data List State */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#111827]">
                  {currentSection.label}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingPolicy(policyList[0]);
                  setIsCreating(true);
                }}
                className="bg-[#A0522D] transition text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-[#8B4513] cursor-pointer"
              >
                <FiEdit2 size={16} />
                {t("edit") || "Edit"}
              </button>
            </div>

            <div className="space-y-4">
              {policyList.map((item, index) => (
                <div
                  key={item.id || index}
                  className="rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] p-6 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8DDD4] pb-4">
                    <div>
                      <h3 className="text-[17px] font-semibold text-[#1C2C56] flex items-center gap-2">
                        <FiFileText className="text-[#A0522D]" size={18} />
                        {item.title}
                      </h3>
                      {item.updated_at && (
                        <span className="flex items-center gap-1 text-[13px] text-[#8C6E5D] mt-1">
                          Updated: {new Date(item.updated_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {item.version && (
                        <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                          v{item.version}
                        </span>
                      )}
                      {item.language && (
                        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 uppercase">
                          {item.language}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${item.isActive !== false
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        <FiCheckCircle size={12} />
                        {item.isActive !== false ? (t("active") || "Active") : (t("inactive") || "Inactive")}
                      </span>
                    </div>
                  </div>

                  {/* HTML Content Body */}
                  <div
                    className="mt-4 text-sm text-[#2A211D] leading-relaxed prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
