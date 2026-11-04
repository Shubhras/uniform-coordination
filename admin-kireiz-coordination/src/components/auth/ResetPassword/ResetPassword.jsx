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

export const ResetPassword = ({
  signInUrl = "/sign-in",
  forgotPasswordUrl = "/forgot-password",
  onResetPasswordSubmit,
  initialMessage = "",
  isValidating = false,
  isTokenValid = true,
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
        {isValidating ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-8 h-8 border-4 border-[#003560] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Validating reset link...</p>
          </div>
        ) : !isTokenValid ? (
          <div>
            <div className="mb-6">
              <h2 className="font-[Plus Jakarta Sans] font-medium text-[28px] tracking-[0.18px] text-[#003560] mb-2">
                Link Expired
              </h2>
              <p className="font-[Plus Jakarta Sans] font-medium text-sm tracking-[0.15px] text-[#4C4E64AD]">
                This password reset link has expired or is invalid.
              </p>
            </div>
            {message && (
              <Alert showIcon className="mb-6" type="danger">
                <span className="break-all">{message}</span>
              </Alert>
            )}
            <Button
              block
              variant="solid"
              type="button"
              className="bg-[#003560] hover:bg-[#002848] text-white"
              onClick={() => router.push(forgotPasswordUrl)}
            >
              Request New Reset Link
            </Button>
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
              <Button block variant="solid" type="button" onClick={handleContinue}>
                Change Password
              </Button>
            </ResetPasswordForm>
          </div>
        )}

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
    </SplitResetPassword>
  );
};

export default ResetPassword;
