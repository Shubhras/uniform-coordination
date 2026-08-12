"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FiMail, FiServer, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiGeneralSettingList,
  apiUpdateGeneralSetting,
} from "@/services/SystemSetting";
import Spinner from "@/components/ui/Spinner";
import Switcher from "@/components/ui/Switcher";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";

const EmailNotifications = () => {
  const t = useTranslations("systemSettings.emailNotifications");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [settings, setSettings] = useState({
    email_host: "",
    email_port: 587,
    email_username: "",
    email_password: "",
    email_use_tls: true,
    email_from_address: "",
    email_from_name: "",
    email_notify_registration: true,
    email_notify_order_placed: true,
    email_notify_payment_success: true,
    email_notify_payment_failure: true,
    email_notify_shipping: true,
    email_notify_return_received: true,
    email_notify_return_overdue: true,
    email_notify_late_fee: true,
  });

  useEffect(() => {
    getEmailSettings();
  }, []);

  const getEmailSettings = async () => {
    try {
      setLoading(true);
      const res = await apiGeneralSettingList(accessToken);
      if (res?.data) {
        setSettings((prev) => ({
          ...prev,
          ...res.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching email settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Append existing general settings fields to prevent overwriting with blanks
      const currentSettingsRes = await apiGeneralSettingList(accessToken);
      const currentData = currentSettingsRes?.data || {};

      Object.keys(currentData).forEach((key) => {
        if (key !== "logo" && currentData[key] !== null) {
          formData.append(key, currentData[key]);
        }
      });

      // Append SMTP & Email Settings
      formData.set("email_host", settings.email_host || "");
      formData.set("email_port", settings.email_port || 587);
      formData.set("email_username", settings.email_username || "");
      formData.set("email_password", settings.email_password || "");
      formData.set("email_use_tls", settings.email_use_tls ? "true" : "false");
      formData.set("email_from_address", settings.email_from_address || "");
      formData.set("email_from_name", settings.email_from_name || "");

      // Append Notification Toggles
      formData.set("email_notify_registration", settings.email_notify_registration ? "true" : "false");
      formData.set("email_notify_order_placed", settings.email_notify_order_placed ? "true" : "false");
      formData.set("email_notify_payment_success", settings.email_notify_payment_success ? "true" : "false");
      formData.set("email_notify_payment_failure", settings.email_notify_payment_failure ? "true" : "false");
      formData.set("email_notify_shipping", settings.email_notify_shipping ? "true" : "false");
      formData.set("email_notify_return_received", settings.email_notify_return_received ? "true" : "false");
      formData.set("email_notify_return_overdue", settings.email_notify_return_overdue ? "true" : "false");
      formData.set("email_notify_late_fee", settings.email_notify_late_fee ? "true" : "false");

      const res = await apiUpdateGeneralSetting(accessToken, formData);
      toast.push(
        <Notification title="Success" type="success">
          {res.message || "Email notifications updated successfully"}
        </Notification>
      );
      setIsEditing(false);
      getEmailSettings();
    } catch (error) {
      console.error("Error updating email settings:", error);
      toast.push(
        <Notification title="Error" type="danger">
          Failed to save settings. Please try again.
        </Notification>
      );
    } finally {
      setLoading(false);
    }
  };

  const notificationList = [
    {
      key: "email_notify_registration",
      label: t("items.registrationLabel"),
      description: t("items.registrationDesc"),
    },
    {
      key: "email_notify_order_placed",
      label: t("items.orderPlacedLabel"),
      description: t("items.orderPlacedDesc"),
    },
    {
      key: "email_notify_payment_success",
      label: t("items.paymentSuccessLabel"),
      description: t("items.paymentSuccessDesc"),
    },
    {
      key: "email_notify_payment_failure",
      label: t("items.paymentFailureLabel"),
      description: t("items.paymentFailureDesc"),
    },
    {
      key: "email_notify_shipping",
      label: t("items.shippingLabel"),
      description: t("items.shippingDesc"),
    },
    {
      key: "email_notify_return_received",
      label: t("items.returnReceivedLabel"),
      description: t("items.returnReceivedDesc"),
    },
    {
      key: "email_notify_return_overdue",
      label: t("items.returnOverdueLabel"),
      description: t("items.returnOverdueDesc"),
    },
    {
      key: "email_notify_late_fee",
      label: t("items.lateFeeLabel"),
      description: t("items.lateFeeDesc"),
    },
  ];

  return (
    <div className="mt-5 min-h-screen">
      {loading && !isEditing ? (
        <div className="flex h-[400px] items-center justify-center rounded-[24px] border border-[#E8DDD4] bg-white">
          <Spinner size={40} customColorClass="text-[#A85A32]" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* SMTP Configuration Card */}
          <div className="rounded-[24px] border border-[#E8DDD4] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#F5E6DA] pb-4 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5E6DA] text-[#A85A32]">
                <FiServer size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2F241F]">{t("smtpTitle")}</h3>
                <p className="text-xs text-[#8C6E5D]">{t("smtpSubtitle")}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">{t("smtpHostLabel")}</label>
                <input
                  className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none focus:border-[#A85A32] disabled:bg-[#FAF6F3]"
                  value={settings.email_host || ""}
                  disabled={!isEditing}
                  onChange={(e) => setSettings({ ...settings, email_host: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">{t("smtpPortLabel")}</label>
                <input
                  type="number"
                  className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none focus:border-[#A85A32] disabled:bg-[#FAF6F3]"
                  value={settings.email_port || 587}
                  disabled={!isEditing}
                  onChange={(e) => setSettings({ ...settings, email_port: parseInt(e.target.value) || 587 })}
                />
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">{t("usernameLabel")}</label>
                <input
                  className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none focus:border-[#A85A32] disabled:bg-[#FAF6F3]"
                  value={settings.email_username || ""}
                  disabled={!isEditing}
                  onChange={(e) => setSettings({ ...settings, email_username: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">{t("passwordLabel")}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] pl-4 pr-10 text-sm outline-none focus:border-[#A85A32] disabled:bg-[#FAF6F3]"
                    value={settings.email_password || ""}
                    disabled={!isEditing}
                    onChange={(e) => setSettings({ ...settings, email_password: e.target.value })}
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C6E5D]"
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">{t("senderNameLabel")}</label>
                <input
                  className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none focus:border-[#A85A32] disabled:bg-[#FAF6F3]"
                  value={settings.email_from_name || ""}
                  disabled={!isEditing}
                  onChange={(e) => setSettings({ ...settings, email_from_name: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">{t("senderEmailLabel")}</label>
                <input
                  type="email"
                  className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none focus:border-[#A85A32] disabled:bg-[#FAF6F3]"
                  value={settings.email_from_address || ""}
                  disabled={!isEditing}
                  onChange={(e) => setSettings({ ...settings, email_from_address: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 md:col-span-2 pt-2">
                <input
                  type="checkbox"
                  id="email_use_tls"
                  className="h-4 w-4 rounded border-[#E9DDD4] accent-[#A85A32] disabled:opacity-60"
                  checked={settings.email_use_tls}
                  disabled={!isEditing}
                  onChange={(e) => setSettings({ ...settings, email_use_tls: e.target.checked })}
                />
                <label htmlFor="email_use_tls" className="text-sm font-semibold text-[#8C6E5D] cursor-pointer select-none">
                  {t("useTlsLabel")}
                </label>
              </div>
            </div>
          </div>

          {/* Notification Preferences Card */}
          <div className="rounded-[24px] border border-[#E8DDD4] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#F5E6DA] pb-4 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5E6DA] text-[#A85A32]">
                <FiMail size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2F241F]">{t("customerNotificationTitle")}</h3>
                <p className="text-xs text-[#8C6E5D]">{t("customerNotificationSubtitle")}</p>
              </div>
            </div>

            <div className="divide-y divide-[#F5E6DA]">
              {notificationList.map((item) => (
                <div key={item.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="pr-4">
                    <p className="text-[14px] font-semibold text-[#2F241F]">{item.label}</p>
                    <p className="text-xs text-[#8C6E5D] mt-0.5">{item.description}</p>
                  </div>
                  <Switcher
                    disabled={!isEditing}
                    checked={settings[item.key]}
                    switcherClass="bg-[#A85A32]"
                    onChange={(checked) => setSettings({ ...settings, [item.key]: checked })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-xl bg-[#A85A32] px-8 py-3 font-medium text-white hover:bg-[#8f4c2a] transition duration-150"
              >
                {t("edit")}
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    getEmailSettings();
                  }}
                  className="rounded-xl border border-[#E8DDD4] bg-white px-8 py-3 font-medium text-[#6E5A4D] hover:bg-[#FAF6F3] transition duration-150"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleUpdate}
                  className="rounded-xl bg-[#A85A32] px-8 py-3 font-medium text-white hover:bg-[#8f4c2a] transition duration-150 flex items-center gap-2"
                >
                  {loading && <Spinner size={16} customColorClass="text-white" />}
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

export default EmailNotifications;
