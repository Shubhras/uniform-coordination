"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FiImage, FiUpload } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import Skeleton from "@/components/ui/Skeleton";
import DatePicker from "@/components/ui/DatePicker";
import {
  apiGeneralSettingList,
  apiUpdateGeneralSetting,
} from "@/services/SystemSettings";
import Spinner from "@/components/ui/Spinner";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";

const GeneralSettings = () => {
  const t = useTranslations("systemSettings.generalSettings");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
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

      if (res?.status) {
        toast.push(
          <Notification title="Success" type="success">
            {res.message || "Updated successfully"}
          </Notification>,
        );
        setIsEditing(false);
        getGeneralSettings();
      }
    } catch (error) {
      console.log("UPDATE ERROR", error);
    } finally {
      setLoading(false);
    }
  };

  const getGeneralSettings = async () => {
    try {
      setLoading(true);
      const res = await apiGeneralSettingList(accessToken);
      if (res?.status) {
        setSettings(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6">
      {loading ? (
        <div className="flex items-center justify-center p-10">
          <Spinner />
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Company Name */}
            <div>
              <label className="mb-2 block text-[13px] font-semibold">
                {t("companyNameLabel")}
              </label>

              <input
                className="h-10 w-full rounded-xl border border-[#E9DDD4] px-4 text-sm outline-none"
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
              <label className="mb-2 block text-[13px] font-semibold">
                {t("businessAddressLabel")}
              </label>

              <input
                className="h-10 w-full rounded-xl border border-[#E9DDD4] px-4 text-sm outline-none"
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
              <label className="mb-2 block text-[13px] font-semibold">
                {t("supportEmailLabel")}
              </label>

              <input
                className="h-10 w-full rounded-xl border border-[#E9DDD4] px-4 text-sm outline-none"
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
              <label className="mb-2 block text-[13px] font-semibold">
                {t("contactNumberLabel")}
              </label>

              <input
                className="h-10 w-full rounded-xl border border-[#E9DDD4] px-4 text-sm outline-none"
                type="text"
                inputMode="numeric"
                value={settings.contact_number || ""}
                readOnly={!isEditing}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setSettings({
                    ...settings,
                    contact_number: value,
                  });
                }}
              />
            </div>

            {/* Language */}
            <div>
              <label className="mb-2 block text-[13px] font-semibold">
                {t("defaultLanguageLabel")}
              </label>

              <input
                className="h-10 w-full rounded-xl border border-[#E9DDD4] px-4 text-sm outline-none"
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
              <label className="mb-2 block text-[13px] font-semibold">
                {t("defaultCurrencyLabel")}
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E9DDD4] px-4 text-sm outline-none"
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
              <label className="mb-2 block text-[13px] font-semibold">
                {t("timeZoneLabel")}
              </label>

              <input
                className="h-10 w-full rounded-xl border border-[#E9DDD4] px-4 text-sm outline-none"
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
              <label className="mb-2 block text-[13px] font-semibold">
                {t("dateFormatLabel")}
              </label>
              <DatePicker
                type="date"
                value={
                  settings.date_format ? new Date(settings.date_format) : null
                }
                inputFormat="YYYY/MM/DD"
                disabled={!isEditing}
                className="w-full"
                onChange={(date) =>
                  setSettings({
                    ...settings,
                    date_format: date,
                  })
                }
              />
            </div>
          </div>

          {/* Upload */}
          <div className="mt-8">
            <label className="mb-2 block text-[13px] font-semibold">{t("logoLabel")}</label>

            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#E6D4C8] bg-[#FFFDFC]">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt={t("companyLogoAlt")}
                  className="mb-3 max-h-52 max-w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full">
                    <FiImage size={22} className="text-[#1C4FA8]" />
                  </div>

                  <p className="mt-3 text-sm text-gray-500">
                    No logo available
                  </p>
                </div>
              )}

              <input
                id="logo-upload"
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

              {isEditing && (
                <>
                  <label
                    htmlFor="logo-upload"
                    className="mt-4 cursor-pointer rounded-lg bg-[#1C4FA8] px-4 py-2 text-white hover:bg-[#163f88]"
                  >
                    <FiUpload className="mr-2 inline" />
                    {t("uploadLogo")}
                  </label>

                  {logoFile && (
                    <p className="mt-2 text-sm text-gray-500">
                      {logoFile.name}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 flex justify-end gap-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-lg bg-[#1C4FA8] px-5 py-2 font-medium text-white hover:bg-[#1C4FA8]"
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
                  className="rounded-lg border border-[#E8DDD4] bg-white px-5 py-2 font-medium text-[#6E5A4D]"
                >
                  {t("cancel")}
                </button>

                <button
                  onClick={handleUpdate}
                  className="rounded-lg bg-[#1C4FA8] px-5 py-2 font-medium text-white hover:bg-[#1C4FA8]"
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
