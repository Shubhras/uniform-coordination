"use client";
import ForgotPassword from "@/components/auth/ForgotPassword";
import SplitForgotPassword from "@/components/layouts/AuthLayout/SplitForgotPass";
import { apiForgotPassword } from "@/services/AuthService";

const ForgotPasswordDemoSplit = () => {
  const handleForgotPasswordSubmit = async ({
    values,
    setSubmitting,
    setMessage,
    setEmailSent,
  }) => {
    try {
      setSubmitting(true);
      await apiForgotPassword(values);
      setEmailSent(true);
    } catch (error) {
      setMessage(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SplitForgotPassword>
      <ForgotPassword
        signInUrl="/auth/sign-in-split"
        onForgotPasswordSubmit={handleForgotPasswordSubmit}
      />
    </SplitForgotPassword>
  );
};

export default ForgotPasswordDemoSplit;
