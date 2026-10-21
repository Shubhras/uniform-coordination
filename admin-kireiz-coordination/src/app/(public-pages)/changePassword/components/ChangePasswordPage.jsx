"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import { Form, FormItem } from "@/components/ui/Form";
import { HiCheck } from "react-icons/hi";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import PasswordInput from "@/components/shared/PasswordInput";
import { apiChangePassword } from "@/services/AuthService";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { FiLock, FiAlertCircle, FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";
import signOut from "@/server/actions/auth/handleSignOut";

/* ----------------_toggle schema ---------------- */
const passwordSchema = z
  .string({
    required_error: "New password is required",
  })
  .min(1, "New password is required")
  .min(8, "Password must be at least 8 characters")
  .regex(/[0-9]/, "Must include a number")
  .regex(/[^A-Za-z0-9]/, "Must include a symbol");

const validationSchema = z
  .object({
    currentPassword: z
      .string({
        required_error: "Current password is required",
      })
      .min(1, "Current password is required"),

    newPassword: passwordSchema,

    confirmPassword: z
      .string({
        required_error: "Confirm password is required",
      })
      .min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password does not match",
  });
/* ---------------- component ---------------- */
const ChangePassword = () => {
  const router = useRouter();
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  const {
    handleSubmit,
    control,
    watch,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(validationSchema),
  });

  const newPassword = watch("newPassword") || "";
  const confirmPassword = watch("confirmPassword") || "";

  const rules = useMemo(
    () => ({
      length: newPassword.length >= 8,
      number: /\d/.test(newPassword),
      symbol: /[^A-Za-z0-9]/.test(newPassword),
      match: newPassword.length > 0 && newPassword === confirmPassword,
    }),
    [newPassword, confirmPassword],
  );

  const onSubmit = async (values) => {
    setApiError("");
    setApiSuccess("");
    try {
      const payload = {
        current_password: values.currentPassword,
        new_password: values.newPassword,
        confirm_password: values.confirmPassword,
      };

      const res = await apiChangePassword(payload, accessToken);
      const successMsg =
        res?.message || "Password changed successfully. Please login again.";
      setApiSuccess(successMsg);
      toast.push(
        <Notification title="Success" type="success">
          {successMsg}
        </Notification>,
      );
      reset();

      // Automatically sign out after password change since existing tokens are invalidated
      setTimeout(async () => {
        try {
          await signOut();
        } catch {
          router.push("/sign-in");
        }
      }, 1500);
    } catch (error) {
      console.error("Change password error:", error);
      const data = error?.response?.data;
      let errMsg = "Failed to update password.";

      if (data) {
        if (
          typeof data.message === "string" &&
          data.message.trim() &&
          data.message !== "Validation Error"
        ) {
          errMsg = data.message;
        }

        const errSource =
          data.errors ||
          data.error ||
          (typeof data.message === "object" ? data.message : null);

        if (errSource && typeof errSource === "object") {
          if (errSource.current_password) {
            const currentErr = Array.isArray(errSource.current_password)
              ? errSource.current_password[0]
              : String(errSource.current_password);
            setError("currentPassword", {
              type: "server",
              message: currentErr,
            });
            errMsg = currentErr;
          }
          if (errSource.new_password) {
            const newErr = Array.isArray(errSource.new_password)
              ? errSource.new_password[0]
              : String(errSource.new_password);
            setError("newPassword", { type: "server", message: newErr });
            if (!errSource.current_password) errMsg = newErr;
          }
          if (errSource.confirm_password || errSource.confirm_new_password) {
            const confirmErr = Array.isArray(
              errSource.confirm_password || errSource.confirm_new_password,
            )
              ? (errSource.confirm_password ||
                  errSource.confirm_new_password)[0]
              : String(
                  errSource.confirm_password ||
                    errSource.confirm_new_password,
                );
            setError("confirmPassword", {
              type: "server",
              message: confirmErr,
            });
          }
        }
      }

      setApiError(errMsg);
      toast.push(
        <Notification title="Error" type="danger">
          {errMsg}
        </Notification>,
      );
    }
  };

  const progressValue = [rules.length, rules.number, rules.symbol].filter(
    Boolean,
  ).length;

  const progressPercent = (progressValue / 3) * 100;

  return (
    <div className="bg-white md:p-6 p-3 rounded-2xl  max-w-7xl mx-auto shadow-md mt-3">
      <Form onSubmit={handleSubmit(onSubmit)}>
        <h4 className="text-[#003562] text-lg font-semibold mb-1 flex items-center gap-1">
          <FiLock size={23} />
          Change Password
        </h4>
        <p className="text-sm text-gray-500 mb-6">
          Secure your account with a strong password
        </p>

        {/* Top alerts */}
        {apiError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiAlertCircle size={18} className="shrink-0" />
              <span>{apiError}</span>
            </div>
            <button
              type="button"
              onClick={() => setApiError("")}
              className="text-red-400 hover:text-red-600 ml-2"
            >
              <FiX size={18} />
            </button>
          </div>
        )}

        {apiSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <HiCheck size={18} className="shrink-0 text-green-600" />
            <span>{apiSuccess}</span>
          </div>
        )}

        {/* Current Password */}
        <FormItem
          label="Current Password"
          invalid={Boolean(errors.currentPassword)}
          errorMessage={errors.currentPassword?.message}
        >
          <Controller
            name="currentPassword"
            control={control}
            render={({ field }) => (
              <PasswordInput
                autoComplete="off"
                placeholder="********"
                {...field}
              />
            )}
          />
        </FormItem>

        {/* New Password */}
        <FormItem
          label="New Password"
          invalid={Boolean(errors.newPassword)}
          errorMessage={errors.newPassword?.message}
        >
          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <PasswordInput
                autoComplete="off"
                placeholder="********"
                {...field}
              />
            )}
          />
        </FormItem>

        {/* Password Strength Progress */}
        <div className="mb-4">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 bg-[#1C2C56]`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Password Rules */}
        <div className="flex flex-wrap gap-4 text-sm mb-6">
          <Rule label="8+ Character" active={rules.length} />
          <Rule label="Number" active={rules.number} />
          <Rule label="Symbol" active={rules.symbol} />
        </div>

        {/* Confirm Password */}
        <FormItem
          label="Confirm New Password"
          invalid={Boolean(errors.confirmPassword)}
          errorMessage={errors.confirmPassword?.message}
        >
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <PasswordInput
                autoComplete="off"
                placeholder="********"
                {...field}
              />
            )}
          />
        </FormItem>

        {/* Match Indicator */}
        <div className="flex flex-wrap gap-4 text-sm mb-6">
          <Rule label="Password match" active={rules.match} />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => router.back()}
            className="border px-6 py-2 rounded-md hover:bg-gray-50 transition"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            size="sm"
            className="bg-[#1C4FA8] px-6 text-white py-2 rounded-md"
          >
            Update
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ChangePassword;

/* ---------------- helper ---------------- */
const Rule = ({ label, active }) => (
  <div
    className={`flex items-center gap-2 ${
      active ? "text-green-600" : "text-gray-400"
    }`}
  >
    <HiCheck />
    <span>{label}</span>
  </div>
);
