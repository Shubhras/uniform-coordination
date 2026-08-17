"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FiSave } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import {
  apiGeneralSettingList,
  apiUpdateSystemSettings,
} from "@/services/SystemSettings";

/*
 * Controls which events raise a card on the Dashboard's "Active Alerts" list,
 * and the SLA (in days) each is timed from. Same SystemSettings row and API
 * as Email & Notifications — this is just a different set of its fields.
 */

const notify = (title, type, message) =>
  toast.push(
    <Notification title={title} type={type}>
      {message}
    </Notification>,
  );

const SystemAlerts = () => {
  const t = useTranslations("systemSettings.systemAlerts");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const alerts = [
    {
      enabledField: "alert_pending_review_enabled",
      slaField: "alert_pending_review_sla_days",
      label: t("pendingReviewLabel"),
      hint: t("pendingReviewHint"),
    },
    {
      enabledField: "alert_awaiting_customer_enabled",
      slaField: "alert_awaiting_customer_sla_days",
      label: t("awaitingCustomerLabel"),
      hint: t("awaitingCustomerHint"),
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
        setForm({
          alert_pending_review_enabled: d.alert_pending_review_enabled ?? true,
          alert_pending_review_sla_days: d.alert_pending_review_sla_days ?? 3,
          alert_awaiting_customer_enabled:
            d.alert_awaiting_customer_enabled ?? true,
          alert_awaiting_customer_sla_days:
            d.alert_awaiting_customer_sla_days ?? 3,
        });
      }
    } catch (error) {
      console.error("Failed to load system alert settings:", error);
      notify("Error", "danger", "Could not load system alert settings");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = (field) => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const changeSla = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (saving || !form) return;

    try {
      setSaving(true);

      const payload = {
        ...form,
        alert_pending_review_sla_days: Number(form.alert_pending_review_sla_days) || 1,
        alert_awaiting_customer_sla_days:
          Number(form.alert_awaiting_customer_sla_days) || 1,
      };

      const res = await apiUpdateSystemSettings(accessToken, payload);
      if (res?.success) {
        notify("Success", "success", "System alert settings saved");
      } else {
        notify("Error", "danger", res?.message || "Could not save settings");
      }
    } catch (error) {
      console.error("Failed to save system alert settings:", error);
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
        <div className="space-y-4 mt-6">
          {[0, 1].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      <div className="border border-[#E2E8F0] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#1C2C56]">
          {t("sectionTitle")}
        </h2>
        <p className="text-sm text-[#64748B] mt-1">{t("sectionSubtitle")}</p>

        <div className="mt-6 space-y-5">
          {alerts.map((alert) => (
            <div
              key={alert.enabledField}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 py-3 border-b border-[#F1F5F9] last:border-0"
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[alert.enabledField]}
                  onChange={() => toggle(alert.enabledField)}
                  className="w-4 h-4 mt-0.5 accent-[#1C4FA8] flex-shrink-0"
                />
                <span>
                  <span className="block text-sm text-[#1C2C56]">
                    {alert.label}
                  </span>
                  <span className="block text-xs text-[#94A3B8] mt-0.5">
                    {alert.hint}
                  </span>
                </span>
              </label>

              <div className="flex items-center gap-2 md:ml-8">
                <input
                  type="number"
                  min={1}
                  max={365}
                  disabled={!form[alert.enabledField]}
                  value={form[alert.slaField]}
                  onChange={(e) => changeSla(alert.slaField, e.target.value)}
                  className="w-20 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1C4FA8]/30 disabled:opacity-50"
                />
                <span className="text-sm text-[#64748B]">{t("daysLabel")}</span>
              </div>
            </div>
          ))}
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

export default SystemAlerts;
