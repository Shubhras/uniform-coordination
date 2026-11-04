"use client";
import { useState, useEffect } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ActionLink from "@/components/shared/ActionLink";
import ResetPasswordForm from "./ResetPasswordForm";
import useTimeOutMessage from "@/utils/hooks/useTimeOutMessage";
import { useRouter } from "next/navigation";
import { FiChevronLeft } from "react-icons/fi";
import SplitResetPassword from "@/components/layouts/AuthLayout/SplitResetPass";

export const ResetPassword = ({
  signInUrl = "/sign-in",
  forgotPasswordUrl = "/forgot-password",
  onResetPasswordSubmit,
  initialMessage = "",
  isValidating = false,
  isTokenValid = true,
  tokenErrorMessage = "",
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

  const handleRequestNewLink = () => {
    router.push(forgotPasswordUrl);
  };

  return (
    <SplitResetPassword>
      <div className="mx-4">
        {isValidating ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size={36} className="text-[#1C2C56] mb-3" />
            <p className="font-[Plus Jakarta Sans] font-medium text-sm text-[#4C4E64AD]">
              Verifying reset link...
            </p>
          </div>
        ) : !isTokenValid ? (
          <div>
            <div className="mb-6">
              <h2 className="font-[Plus Jakarta Sans] font-medium text-[28px] tracking-[0.18px] text-[#003560] mb-2">
                Reset link expired
              </h2>
              <p className="font-[Plus Jakarta Sans] font-medium text-sm tracking-[0.15px] text-[#4C4E64AD]">
                This password reset link is invalid or has expired.
              </p>
            </div>
            <Alert showIcon className="mb-6" type="danger">
              <span className="break-all">
                {tokenErrorMessage ||
                  "Invalid or expired reset link. Please request a new password reset."}
              </span>
            </Alert>
            <Button
              block
              variant="solid"
              type="button"
              className="bg-[#1C2C56] hover:bg-[#152243] text-white"
              onClick={handleRequestNewLink}
            >
              Request New Reset Link
            </Button>
            <div className="mt-4 text-center text-base">
              <ActionLink
                href={signInUrl}
                className="heading-text text-blue-400"
                themeColor={false}
              >
                <span className="flex justify-center items-center gap-2">
                  <FiChevronLeft size={24} />
                  <span>Back to Login</span>
                </span>
              </ActionLink>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              {resetComplete ? (
                <>
                  <h2 className="font-[Plus Jakarta Sans] font-medium text-[28px] tracking-[0.18px] text-[#003560] mb-2">
                    Reset done
                  </h2>
                  <p className="font-[Plus Jakarta Sans] font-medium text-sm tracking-[0.15px] text-[#4C4E64AD]">
                    Your password has been successfully reset
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-[Plus Jakarta Sans] font-medium text-[28px] tracking-[0.18px] text-[#003560] mb-2">
                    Reset password
                  </h2>
                  <p className="font-[Plus Jakarta Sans] font-medium text-sm tracking-[0.15px] text-[#4C4E64AD]">
                    Your new password must different to previos password
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
              <Button block variant="solid" type="button" onClick={handleContinue}>
                Change Password
              </Button>
            </ResetPasswordForm>
            <div className="mt-4 text-center text-base">
              <ActionLink
                href={signInUrl}
                className="heading-text text-blue-400"
                themeColor={false}
              >
                <span className="flex justify-center items-center gap-2">
                  <FiChevronLeft size={24} />
                  <span>Back to Login</span>
                </span>
              </ActionLink>
            </div>
          </div>
        )}
      </div>
    </SplitResetPassword>
  );
};

export default ResetPassword;
