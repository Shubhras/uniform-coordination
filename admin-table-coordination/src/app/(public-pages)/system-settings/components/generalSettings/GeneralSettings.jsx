"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { FiImage } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiGeneralSettingList,
  apiUpdateGeneralSetting,
} from "@/services/SystemSetting";
import Spinner from "@/components/ui/Spinner";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";

const GeneralSettings = () => {
  const t = useTranslations("systemSettings.generalSettings");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [loading, setLoading] = useState(false);

  const [logoFile, setLogoFile] = useState(null);
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);

  const [settings, setSettings] = useState({
    company_name: "",
    business_address: "",
    support_email: "",
    contact_number: "",
    default_language: "",
    default_currency: "",
    time_zone: "",
    date_format: "",
    logo: "",
  });

  useEffect(() => {
    getGeneralSettings();
  }, []);

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("company_name", settings.company_name);
      formData.append("business_address", settings.business_address);
      formData.append("support_email", settings.support_email);
      formData.append("contact_number", settings.contact_number);
      formData.append("default_language", settings.default_language);
      formData.append("default_currency", settings.default_currency);
      formData.append("time_zone", settings.time_zone);
      formData.append("date_format", settings.date_format);

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const res = await apiUpdateGeneralSetting(accessToken, formData);
      toast.push(
        <Notification title="Success" type="success">
          {res.message}
        </Notification>,
      );

      setIsEditing(false);

      getGeneralSettings();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getGeneralSettings = async () => {
    try {
      setLoading(true);

      const res = await apiGeneralSettingList(accessToken);
      // if (res?.data?.success) {
      setSettings(res.data);
      // }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-5">
      {loading ? (
        <div className="flex h-[500px] items-center justify-center rounded-[24px] border border-[#E8DDD4] bg-white">
          <Spinner size={40} customColorClass="text-[#A0522D]" />
        </div>
      ) : (
        <div className="rounded-[24px] border border-[#E8DDD4] bg-white p-5 shadow-sm">
          {/* Form */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Company */}
            <div>
              <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">
                {t("companyNameLabel")}
              </label>

              <input
                className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none focus:border-[#B86A3C]"
                value={settings.company_name || ""}
                readOnly={!isEditing}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    company_name: e.target.value,
                  })
                }
              />
            </div>

            {/* Address */}

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">
                {t("businessAddressLabel")}
              </label>

              <input
                className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none focus:border-[#B86A3C]"
                value={settings.business_address || ""}
                readOnly={!isEditing}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    business_address: e.target.value,
                  })
                }
              />
            </div>

            {/* Email */}

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">
                {t("supportEmailLabel")}
              </label>

              <input
                className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none"
                value={settings.support_email || ""}
                readOnly={!isEditing}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    support_email: e.target.value,
                  })
                }
              />
            </div>

            {/* Contact */}

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">
                {t("contactNumberLabel")}
              </label>

              <input
                className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none"
                value={settings.contact_number || ""}
                readOnly={!isEditing}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact_number: e.target.value,
                  })
                }
              />
            </div>

            {/* Language */}

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">
                {t("defaultLanguageLabel")}
              </label>

              <input
                className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none"
                value={settings.default_language || ""}
                readOnly={!isEditing}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    default_language: e.target.value,
                  })
                }
              />
            </div>

            {/* Currency */}

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">
                {t("defaultCurrencyLabel")}
              </label>

              <input
                className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none"
                value={settings.default_currency || ""}
                readOnly={!isEditing}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    default_currency: e.target.value,
                  })
                }
              />
            </div>

            {/* Timezone */}

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">
                {t("timeZoneLabel")}
              </label>

              <input
                className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none"
                value={settings.time_zone || ""}
                readOnly={!isEditing}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    time_zone: e.target.value,
                  })
                }
              />
            </div>

            {/* Date */}

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">
                {t("dateFormatLabel")}
              </label>

              <input
                className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none"
                value={settings.date_format || ""}
                readOnly={!isEditing}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    date_format: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Upload */}

          <div className="mt-8">
            <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">
              {t("logoLabel")}
            </label>

            <div
              onClick={() => isEditing && fileInputRef.current?.click()}
              className={`flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#E6D4C8] bg-[#FFFDFC] ${
                isEditing ? "cursor-pointer hover:bg-[#FCF7F3]" : ""
              }`}
            >
              {" "}
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt={t("companyLogoAlt")}
                  className="mb-3 max-h-52 max-w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5E6DA]">
                    <FiImage size={22} className="text-[#A0522D]" />
                  </div>

                  <p className="mt-3 text-sm text-gray-500">
                    {t("uploadLogo")}
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;

                  setLogoFile(file);

                  setSettings((prev) => ({
                    ...prev,
                    logo: URL.createObjectURL(file),
                  }));
                }}
              />
            </div>
          </div>

          {/* Footer */}

          <div className="mt-10 flex justify-end gap-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-xl bg-[#A85A32] px-6 py-3 font-medium text-white hover:bg-[#8f4c2a]"
              >
                {t("edit")}
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    getGeneralSettings();
                  }}
                  className="rounded-xl border border-[#E8DDD4] bg-white px-8 py-3 font-medium text-[#6E5A4D]"
                >
                  {t("cancel")}
                </button>

                <button
                  onClick={handleUpdate}
                  className="rounded-xl bg-[#A85A32] px-6 py-3 font-medium text-white hover:bg-[#8f4c2a]"
                >
                  {t("saveChanges")}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralSettings;
