"use client";
import { useState, useEffect } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import ActionLink from "@/components/shared/ActionLink";
import ResetPasswordForm from "./ResetPasswordForm";
import useTimeOutMessage from "@/utils/hooks/useTimeOutMessage";
import { useRouter } from "next/navigation";
import { FiChevronLeft } from "react-icons/fi";
import SplitResetPassword from "@/components/layouts/AuthLayout/SplitResetPass";
import Spinner from "@/components/ui/Spinner";

export const ResetPassword = ({
  signInUrl = "/sign-in",
  onResetPasswordSubmit,
  initialMessage = "",
  isExpired = false,
  isLoading = false,
  errorMessage = "",
}) => {
  const [resetComplete, setResetComplete] = useState(false);

  const [message, setMessage] = useTimeOutMessage();

  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
    }
  }, [initialMessage, setMessage]);

  const router = useRouter();

  const handleContinue = () => {
    router.push(signInUrl);
  };

  return (
    <SplitResetPassword>
      <div className="mx-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Spinner size={40} customColorClass="text-[#A0522D]" />
          </div>
        ) : isExpired ? (
          <>
            <div className="mb-6">
              <h2 className="font-[Plus Jakarta Sans] font-semibold text-[28px] tracking-[0.18px] text-[#0A4B75] mb-2">
                Link Expired
              </h2>
              <p className="font-[Plus Jakarta Sans] font-medium text-sm tracking-[0.15px] text-[#4C4E64AD]">
                This password reset link is invalid or has expired. Please request a new link to reset your password.
              </p>
            </div>
            <Alert showIcon className="mb-6" type="danger">
              <span className="break-all">
                {errorMessage || "Invalid or expired reset link. Please request a new password reset."}
              </span>
            </Alert>
            <Button
              block
              variant="solid"
              type="button"
              className="bg-[#A0522D] hover:bg-[#8B4513] text-white"
              onClick={() => router.push("/forgot-password")}
            >
              Request New Reset Link
            </Button>
            <div className="mt-4 text-center text-base">
              <ActionLink
                href={signInUrl}
                className="heading-text text-[#A0522D]"
                themeColor={false}
              >
                <span className="flex justify-center items-center gap-2">
                  <FiChevronLeft size={24} />
                  <span>Back to Login</span>
                </span>
              </ActionLink>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              {resetComplete ? (
                <>
                  <h2 className="font-[Plus Jakarta Sans] font-semibold text-[28px] tracking-[0.18px] text-[#2A211D] mb-2">
                    Reset done
                  </h2>
                  <p className="font-[Plus Jakarta Sans] font-medium text-sm tracking-[0.15px] text-[#4C4E64AD]">
                    Your password has been successfully reset.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-[Plus Jakarta Sans] font-semibold text-[28px] tracking-[0.18px] text-[#2A211D] mb-2">
                    Reset password
                  </h2>
                  <p className="font-[Plus Jakarta Sans] font-medium text-sm tracking-[0.15px] text-[#4C4E64AD]">
                    Your new password must be different from your previous password.
                  </p>
                </>
              )}
            </div>
            {message && (
              <Alert showIcon className="mb-4" type="danger">
                <span className="break-all">{message}</span>
              </Alert>
            )}
            <ResetPasswordForm
              resetComplete={resetComplete}
              setMessage={setMessage}
              setResetComplete={setResetComplete}
              onResetPasswordSubmit={onResetPasswordSubmit}
            >
              <Button
                block
                variant="solid"
                type="button"
                className="bg-[#A0522D] hover:bg-[#8B4513] text-white"
                onClick={handleContinue}
              >
                Continue to Login
              </Button>
            </ResetPasswordForm>
            <div className="mt-4 text-center text-base">
              <ActionLink
                href={signInUrl}
                className="heading-text text-[#A0522D]"
                themeColor={false}
              >
                <span className="flex justify-center items-center gap-2">
                  <FiChevronLeft size={24} />
                  <span>Back to Login</span>
                </span>
              </ActionLink>
            </div>
          </>
        )}
      </div>
    </SplitResetPassword>
  );
};

export default ResetPassword;
