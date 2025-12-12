"use client";
import ResetPassword from "@/components/auth/ResetPassword";
import SplitResetPassword from "@/components/layouts/AuthLayout/SplitResetPass";
import { apiResetPassword } from "@/services/AuthService";
import { useSearchParams } from "next/navigation";

const ResetPasswordDemoSplit = () => {
  const searchParams = useSearchParams();

  /** Token or Verification Code ensures the request is tied to the correct user */
  const token = searchParams.get("token");

  const handleResetPassword = async (payload) => {
    const { values, setSubmitting, setMessage, setResetComplete } = payload;
    try {
      setSubmitting(true);
      await apiResetPassword({
        ...values,
        token: token || "",
      });
      setResetComplete?.(true);
    } catch (error) {
      setMessage(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SplitResetPassword>
      <ResetPassword
        signInUrl="/auth/sign-in-split"
        onResetPasswordSubmit={handleResetPassword}
      />
    </SplitResetPassword>
  );
};

export default ResetPasswordDemoSplit;
