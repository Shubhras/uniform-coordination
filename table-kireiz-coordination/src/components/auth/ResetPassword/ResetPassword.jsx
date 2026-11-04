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
  isLinkValid = true,
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
        {isValidating ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner size={40} className="text-[#003560] mb-4" />
            <p className="font-[Plus Jakarta Sans] font-medium text-sm text-[#402936AD]">
              Verifying reset link...
            </p>
          </div>
        ) : !isLinkValid ? (
          <div>
            <div className="mb-6">
              <h2 className="font-[Plus Jakarta Sans] font-medium text-[28px] tracking-[0.18px] text-[#003560] mb-2">
                Link Expired
              </h2>
              <p className="font-[Plus Jakarta Sans] font-medium text-sm tracking-[0.15px] text-[#402936AD]">
                This password reset link is invalid or has expired. Please request a new link to reset your password.
              </p>
            </div>
            {(errorMessage || initialMessage) && (
              <Alert showIcon className="mb-6" type="danger">
                <span className="break-all">{errorMessage || initialMessage}</span>
              </Alert>
            )}
            <div className="mt-4">
              <Button
                block
                variant="solid"
                type="button"
                className="bg-[#A0522D] text-white"
                onClick={() => router.push(forgotPasswordUrl)}
              >
                Request New Reset Link
              </Button>
            </div>
            <div className="mt-4 text-center text-base">
              <ActionLink
                href={signInUrl}
                className="hheading-text text-[#8B4513]"
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
                  <p className="font-[Plus Jakarta Sans] font-medium text-sm tracking-[0.15px] text-[#402936AD]">
                    Your new password must be different from previously used passwords
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
              <Button block variant="solid" type="button" className="bg-[#1C2C56] hover:bg-[#152243] text-white" onClick={handleContinue}>
                Change Password
              </Button>
            </ResetPasswordForm>
            <div className="mt-4 text-center text-base">
              <ActionLink
                href={signInUrl}
                className="hheading-text text-[#8B4513]"
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
