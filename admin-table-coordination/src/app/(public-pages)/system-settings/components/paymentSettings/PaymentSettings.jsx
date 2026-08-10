"use client";

import { useEffect, useState } from "react";
import { FiCreditCard, FiCheckCircle, FiShield, FiBriefcase, FiEye, FiEyeOff } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiGeneralSettingList,
  apiUpdateGeneralSetting,
} from "@/services/SystemSetting";
import Spinner from "@/components/ui/Spinner";
import Switcher from "@/components/ui/Switcher";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";

const PaymentSettings = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  const [settings, setSettings] = useState({
    payment_enable_kakebarai: true,
    payment_enable_credit_card: true,
    payment_enable_paypay: false,
    payment_enable_conbini: false,
    payment_enable_bank_transfer: true,
    payment_enable_applepay: false,
    payment_enable_googlepay: false,
    stripe_publishable_key: "",
    stripe_secret_key: "",
    stripe_webhook_secret: "",
    bank_name: "",
    bank_branch: "",
    bank_account_number: "",
    bank_account_holder: "",
  });

  useEffect(() => {
    getPaymentSettings();
  }, []);

  const getPaymentSettings = async () => {
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
      console.error("Error fetching payment settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Get current general settings fields to avoid overwriting with blanks
      const currentSettingsRes = await apiGeneralSettingList(accessToken);
      const currentData = currentSettingsRes?.data || {};

      Object.keys(currentData).forEach((key) => {
        if (key !== "logo" && currentData[key] !== null) {
          formData.append(key, currentData[key]);
        }
      });

      // Append Payment Gateway Toggles
      formData.set("payment_enable_kakebarai", settings.payment_enable_kakebarai ? "true" : "false");
      formData.set("payment_enable_credit_card", settings.payment_enable_credit_card ? "true" : "false");
      formData.set("payment_enable_paypay", settings.payment_enable_paypay ? "true" : "false");
      formData.set("payment_enable_conbini", settings.payment_enable_conbini ? "true" : "false");
      formData.set("payment_enable_bank_transfer", settings.payment_enable_bank_transfer ? "true" : "false");
      formData.set("payment_enable_applepay", settings.payment_enable_applepay ? "true" : "false");
      formData.set("payment_enable_googlepay", settings.payment_enable_googlepay ? "true" : "false");

      // Append Config Fields
      formData.set("stripe_publishable_key", settings.stripe_publishable_key || "");
      formData.set("stripe_secret_key", settings.stripe_secret_key || "");
      formData.set("stripe_webhook_secret", settings.stripe_webhook_secret || "");
      formData.set("bank_name", settings.bank_name || "");
      formData.set("bank_branch", settings.bank_branch || "");
      formData.set("bank_account_number", settings.bank_account_number || "");
      formData.set("bank_account_holder", settings.bank_account_holder || "");

      const res = await apiUpdateGeneralSetting(accessToken, formData);
      toast.push(
        <Notification title="Success" type="success">
          {res.message || "Payment settings updated successfully"}
        </Notification>
      );
      setIsEditing(false);
      getPaymentSettings();
    } catch (error) {
      console.error("Error updating payment settings:", error);
      toast.push(
        <Notification title="Error" type="danger">
          Failed to save settings. Please try again.
        </Notification>
      );
    } finally {
      setLoading(false);
    }
  };

  const gatewaysList = [
    {
      key: "payment_enable_kakebarai",
      label: "NP Kakebarai (Corporate B2B)",
      description: "Allow corporate customers to pay on credit invoice.",
    },
    {
      key: "payment_enable_credit_card",
      label: "Credit Card (Stripe)",
      description: "Direct online payment processing via Stripe API.",
    },
    {
      key: "payment_enable_paypay",
      label: "PayPay",
      description: "Accept Japan's leading QR code mobile payment.",
    },
    {
      key: "payment_enable_conbini",
      label: "Convenience Store",
      description: "Allow payment at Japanese convenience stores.",
    },
    {
      key: "payment_enable_bank_transfer",
      label: "Bank Transfer",
      description: "Manual direct bank transfer payment option.",
    },
    {
      key: "payment_enable_applepay",
      label: "Apple Pay (Optional)",
      description: "Support express checkout for iOS & macOS users.",
    },
    {
      key: "payment_enable_googlepay",
      label: "Google Pay (Optional)",
      description: "Support express checkout for Android & Chrome users.",
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
          {/* Active Payment Channels Card */}
          <div className="rounded-[24px] border border-[#E8DDD4] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#F5E6DA] pb-4 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5E6DA] text-[#A85A32]">
                <FiCreditCard size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2F241F]">Activated Payment Methods</h3>
                <p className="text-xs text-[#8C6E5D]">Toggle payment gateway integrations available on checkout.</p>
              </div>
            </div>

            <div className="divide-y divide-[#F5E6DA]">
              {gatewaysList.map((item) => (
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

          {/* Stripe Details Card */}
          {settings.payment_enable_credit_card && (
            <div className="rounded-[24px] border border-[#E8DDD4] bg-white p-6 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-3 border-b border-[#F5E6DA] pb-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5E6DA] text-[#A85A32]">
                  <FiShield size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#2F241F]">Stripe API Credentials</h3>
                  <p className="text-xs text-[#8C6E5D]">Configure Stripe payment keys to process credit cards safely.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">Stripe Publishable Key</label>
                  <input
                    className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none focus:border-[#A85A32] disabled:bg-[#FAF6F3]"
                    value={settings.stripe_publishable_key || ""}
                    disabled={!isEditing}
                    onChange={(e) => setSettings({ ...settings, stripe_publishable_key: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">Stripe Secret Key</label>
                  <div className="relative">
                    <input
                      type={showSecretKey ? "text" : "password"}
                      className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] pl-4 pr-10 text-sm outline-none focus:border-[#A85A32] disabled:bg-[#FAF6F3]"
                      value={settings.stripe_secret_key || ""}
                      disabled={!isEditing}
                      onChange={(e) => setSettings({ ...settings, stripe_secret_key: e.target.value })}
                    />
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => setShowSecretKey(!showSecretKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C6E5D]"
                      >
                        {showSecretKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">Stripe Webhook Secret</label>
                  <div className="relative">
                    <input
                      type={showWebhookSecret ? "text" : "password"}
                      className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] pl-4 pr-10 text-sm outline-none focus:border-[#A85A32] disabled:bg-[#FAF6F3]"
                      value={settings.stripe_webhook_secret || ""}
                      disabled={!isEditing}
                      onChange={(e) => setSettings({ ...settings, stripe_webhook_secret: e.target.value })}
                    />
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C6E5D]"
                      >
                        {showWebhookSecret ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer Details Card */}
          {settings.payment_enable_bank_transfer && (
            <div className="rounded-[24px] border border-[#E8DDD4] bg-white p-6 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-3 border-b border-[#F5E6DA] pb-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5E6DA] text-[#A85A32]">
                  <FiBriefcase size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#2F241F]">Bank Account Details</h3>
                  <p className="text-xs text-[#8C6E5D]">Configure target Japanese bank info for manual transfers.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">Bank Name</label>
                  <input
                    className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none focus:border-[#A85A32] disabled:bg-[#FAF6F3]"
                    value={settings.bank_name || ""}
                    disabled={!isEditing}
                    onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">Bank Branch Name</label>
                  <input
                    className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none focus:border-[#A85A32] disabled:bg-[#FAF6F3]"
                    value={settings.bank_branch || ""}
                    disabled={!isEditing}
                    onChange={(e) => setSettings({ ...settings, bank_branch: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">Account Number</label>
                  <input
                    className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none focus:border-[#A85A32] disabled:bg-[#FAF6F3]"
                    value={settings.bank_account_number || ""}
                    disabled={!isEditing}
                    onChange={(e) => setSettings({ ...settings, bank_account_number: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">Account Holder Name</label>
                  <input
                    className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none focus:border-[#A85A32] disabled:bg-[#FAF6F3]"
                    value={settings.bank_account_holder || ""}
                    disabled={!isEditing}
                    onChange={(e) => setSettings({ ...settings, bank_account_holder: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-xl bg-[#A85A32] px-8 py-3 font-medium text-white hover:bg-[#8f4c2a] transition duration-150"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    getPaymentSettings();
                  }}
                  className="rounded-xl border border-[#E8DDD4] bg-white px-8 py-3 font-medium text-[#6E5A4D] hover:bg-[#FAF6F3] transition duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="rounded-xl bg-[#A85A32] px-8 py-3 font-medium text-white hover:bg-[#8f4c2a] transition duration-150 flex items-center gap-2"
                >
                  {loading && <Spinner size={16} customColorClass="text-white" />}
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSettings;
