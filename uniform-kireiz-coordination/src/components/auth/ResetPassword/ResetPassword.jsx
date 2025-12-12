"use client";
import { useState } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import ActionLink from "@/components/shared/ActionLink";
import ResetPasswordForm from "./ResetPasswordForm";
import useTimeOutMessage from "@/utils/hooks/useTimeOutMessage";
import { useRouter } from "next/navigation";
import { FiChevronLeft } from "react-icons/fi";

export const ResetPassword = ({
  signInUrl = "/sign-in",
  onResetPasswordSubmit,
}) => {
  const [resetComplete, setResetComplete] = useState(false);

  const [message, setMessage] = useTimeOutMessage();

  const router = useRouter();

  const handleContinue = () => {
    router.push(signInUrl);
  };

  return (
    <div className="mx-4">
      <div className="mb-6">
        {resetComplete ? (
          <>
            <h2 className="font-[Plus Jakarta Sans] font-medium text-[28px] tracking-[0.18px] text-[#003560] mb-2">
              Reset done
            </h2>
            <p className="font-[Plus Jakarta Sans] font-medium text-sm  tracking-[0.15px] text-[#4C4E64AD]">
              Your password has been successfully reset
            </p>
          </>
        ) : (
          <>
            <h2 className="font-[Plus Jakarta Sans] font-medium text-[28px] tracking-[0.18px] text-[#003560] mb-2">
              Reset password
            </h2>
            <p className="font-[Plus Jakarta Sans] font-medium text-sm  tracking-[0.15px] text-[#4C4E64AD]">
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
  );
};

export default ResetPassword;
