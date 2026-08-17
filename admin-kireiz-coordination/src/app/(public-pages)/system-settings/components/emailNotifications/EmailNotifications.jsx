"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FiSave, FiLock } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import {
  apiGeneralSettingList,
  apiUpdateSystemSettings,
} from "@/services/SystemSettings";

/*
 * DESIGN NOTE — no Figma for this tab.
 *
 * Scope is deliberately limited to how notification emails *present* and *route*.
 * SMTP host, port and credentials are NOT editable here: they are secrets and
 * belong in environment configuration, not a form any admin can open.
 *
 * The toggles map to the notifications KIREIZ FORM actually sends today —
 * registration confirmation, request received, and quotation status changes —
 * plus the internal alert to admins on a new request.
 */

const notify = (title, type, message) =>
  toast.push(
    <Notification title={title} type={type}>
      {message}
    </Notification>,
  );

const EmailNotifications = () => {
  const t = useTranslations("systemSettings.emailNotifications");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSet, setPasswordSet] = useState(false);

  const senderFields = [
    {
      name: "email_sender_name",
      label: t("senderNameLabel"),
      type: "text",
      maxLength: 150,
      placeholder: t("senderNamePlaceholder"),
      hint: t("senderNameHint"),
    },
    {
      name: "email_sender_address",
      label: t("senderAddressLabel"),
      type: "email",
      placeholder: t("senderAddressPlaceholder"),
    },
    {
      name: "email_reply_to",
      label: t("replyToAddressLabel"),
      type: "email",
      placeholder: t("replyToAddressPlaceholder"),
      hint: t("replyToAddressHint"),
    },
  ];

  const toggles = [
    {
      name: "notify_admin_on_new_request",
      label: t("notifyNewQuotationRequest"),
      hint: t("notifyNewQuotationRequestHint"),
    },
    {
      name: "notify_admin_on_new_registration",
      label: t("notifyNewUserRegistration"),
      hint: t("notifyNewUserRegistrationHint"),
    },
    {
      name: "notify_admin_on_login",
      label: t("notifyAdminLogin"),
      hint: t("notifyAdminLoginHint"),
    },
    {
      name: "notify_customer_on_registration",
      label: t("notifyRegistrationConfirmation"),
    },
    {
      name: "notify_customer_on_request_received",
      label: t("notifyRequestReceivedConfirmation"),
    },
    {
      name: "notify_customer_on_status_change",
      label: t("notifyQuotationStatusChange"),
      hint: t("notifyQuotationStatusChangeHint"),
    },
  ];

  const load = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiGeneralSettingList(accessToken);
      const d = res?.data;
      if (d) {
        // The API never returns the SMTP password, only whether one is stored.
        setPasswordSet(!!d.email_password_set);
        setForm({
          email_host: d.email_host || "",
          email_port: d.email_port ?? "",
          email_use_tls: d.email_use_tls ?? true,
          email_username: d.email_username || "",
          // Always starts blank; blank on save means "keep the existing password".
          email_password: "",
          email_sender_name: d.email_sender_name || "",
          email_sender_address: d.email_sender_address || "",
          email_reply_to: d.email_reply_to || "",
          email_footer_note: d.email_footer_note || "",
          notify_admin_on_new_request: d.notify_admin_on_new_request ?? true,
          notify_admin_on_new_registration:
            d.notify_admin_on_new_registration ?? true,
          notify_admin_on_login: d.notify_admin_on_login ?? true,
          notify_customer_on_registration:
            d.notify_customer_on_registration ?? true,
          notify_customer_on_request_received:
            d.notify_customer_on_request_received ?? true,
          notify_customer_on_status_change:
            d.notify_customer_on_status_change ?? true,
          admin_notification_emails: d.admin_notification_emails || "",
        });
      }
    } catch (error) {
      console.error("Failed to load email settings:", error);
      notify("Error", "danger", "Could not load email settings");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const change = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (saving || !form) return;

    // Basic sanity check on the recipient list before sending it on.
    const invalid = (form.admin_notification_emails || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((address) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address));

    if (invalid.length) {
      notify(
        "Invalid email",
        "warning",
        `Not a valid address: ${invalid.join(", ")}`,
      );
      return;
    }

    try {
      setSaving(true);

      const payload = { ...form };
      // Empty port must go as null, not "" — DRF rejects a blank integer.
      payload.email_port = payload.email_port === "" ? null : Number(payload.email_port);
      // Omit the password when untouched so an existing one isn't wiped.
      if (!payload.email_password) delete payload.email_password;

      const res = await apiUpdateSystemSettings(accessToken, payload);
      // This endpoint replies with `success`, not `status`.
      if (res?.success) {
        notify("Success", "success", "Email settings saved");
      } else {
        notify("Error", "danger", res?.message || "Could not save settings");
      }
    } catch (error) {
      console.error("Failed to save email settings:", error);
      notify(
        "Error",
        "danger",
        error?.response?.data?.message || "Could not save settings",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="mt-5 border border-[#E2E8F0] rounded-xl p-6 animate-pulse">
        <div className="h-4 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-11 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      {/* Sender identity */}
      <div className="border border-[#E2E8F0] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#1C2C56]">
          {t("senderIdentitySection")}
        </h2>
        <p className="text-sm text-[#64748B] mt-1">
          {t("senderIdentitySubtitle")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          {senderFields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-[#1C2C56] mb-2">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={change}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1C4FA8]/30"
              />
              {field.hint && (
                <p className="text-xs text-[#94A3B8] mt-1">{field.hint}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5">
          <label className="block text-sm font-medium text-[#1C2C56] mb-2">
            {t("emailFooterLabel")}
          </label>
          <textarea
            name="email_footer_note"
            value={form.email_footer_note}
            onChange={change}
            rows={3}
            placeholder={t("emailFooterPlaceholder")}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1C4FA8]/30"
          />
        </div>

      </div>

      {/* SMTP connection — blank host means fall back to server env config */}
      <div className="border border-[#E2E8F0] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#1C2C56]">
          {t("smtpSection")}
        </h2>
        <p className="text-sm text-[#64748B] mt-1">{t("smtpSubtitle")}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          <div>
            <label className="block text-sm font-medium text-[#1C2C56] mb-2">
              {t("smtpHostLabel")}
            </label>
            <input
              type="text"
              name="email_host"
              value={form.email_host}
              onChange={change}
              maxLength={255}
              placeholder={t("smtpHostPlaceholder")}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1C4FA8]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C2C56] mb-2">
              {t("smtpPortLabel")}
            </label>
            <input
              type="number"
              name="email_port"
              value={form.email_port}
              onChange={change}
              min={1}
              max={65535}
              placeholder="587"
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1C4FA8]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C2C56] mb-2">
              {t("smtpUsernameLabel")}
            </label>
            <input
              type="text"
              name="email_username"
              value={form.email_username}
              onChange={change}
              maxLength={255}
              autoComplete="off"
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1C4FA8]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C2C56] mb-2">
              {t("smtpPasswordLabel")}
            </label>
            <input
              type="password"
              name="email_password"
              value={form.email_password}
              onChange={change}
              maxLength={255}
              autoComplete="new-password"
              placeholder={t("smtpPasswordPlaceholder")}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1C4FA8]/30"
            />
            <p className="text-xs text-[#94A3B8] mt-1">
              {passwordSet ? t("smtpPasswordSetHint") : t("smtpPasswordUnsetHint")}
            </p>
          </div>
        </div>

        <label className="flex items-center gap-3 mt-5 cursor-pointer">
          <input
            type="checkbox"
            name="email_use_tls"
            checked={form.email_use_tls}
            onChange={change}
            className="w-4 h-4 accent-[#1C4FA8]"
          />
          <span className="text-sm text-[#1C2C56]">{t("smtpUseTlsLabel")}</span>
        </label>

        <div className="flex gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 mt-5">
          <FiLock className="text-[#64748B] mt-0.5 flex-shrink-0" size={15} />
          <p className="text-xs text-[#64748B]">{t("smtpFallbackNotice")}</p>
        </div>
      </div>

      {/* Notification routing */}
      <div className="border border-[#E2E8F0] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#1C2C56]">
          {t("notificationsSection")}
        </h2>
        <p className="text-sm text-[#64748B] mt-1">
          {t("notificationsSubtitle")}
        </p>

        <div className="mt-6 space-y-1">
          {toggles.map((toggle) => (
            <label
              key={toggle.name}
              className="flex items-start gap-3 py-3 border-b border-[#F1F5F9] last:border-0 cursor-pointer"
            >
              <input
                type="checkbox"
                name={toggle.name}
                checked={form[toggle.name]}
                onChange={change}
                className="w-4 h-4 mt-0.5 accent-[#1C4FA8] flex-shrink-0"
              />
              <span>
                <span className="block text-sm text-[#1C2C56]">
                  {toggle.label}
                </span>
                {toggle.hint && (
                  <span className="block text-xs text-[#94A3B8] mt-0.5">
                    {toggle.hint}
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-[#1C2C56] mb-2">
            {t("adminNotificationRecipientsLabel")}
          </label>
          <input
            type="text"
            name="admin_notification_emails"
            value={form.admin_notification_emails}
            onChange={change}
            placeholder={t("adminRecipientsPlaceholder")}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1C4FA8]/30"
          />
          <p className="text-xs text-[#94A3B8] mt-1">
            {t("adminRecipientsHint")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={load}
            disabled={saving}
            className="border border-[#CBD5E1] text-[#486284] px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#1C4FA8] text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <FiSave size={15} />
            {saving ? "Saving..." : t("saveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailNotifications;
