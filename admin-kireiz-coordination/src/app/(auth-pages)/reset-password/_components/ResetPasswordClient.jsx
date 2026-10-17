"use client";
import ResetPassword from "@/components/auth/ResetPassword";
import { apiResetPassword } from "@/services/AuthService";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
const ResetPasswordClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("user_id") || searchParams.get("userId");
  const token = searchParams.get("token");

  const handleResetPassword = async (payload) => {
    const { values, setSubmitting, setMessage, setResetComplete } = payload;
    try {
      setSubmitting(true);
      if (!userId || !token) {
        setMessage("Invalid or expired reset link. Please check your email or request a new reset link.");
        return;
      }
      const response = await apiResetPassword({
        user_id: Number(userId),
        token: token,
        new_password: values.newPassword,
        confirm_password: values.confirmPassword,
      });
      if (response?.status === true || response?.statusCode === 200) {
        toast.push(
          <Notification title="Password reset successful!" type="success">
            {response?.message || "You can now login with your new password"}
          </Notification>,
        );
        setResetComplete?.(true);
        setTimeout(() => {
          router.push("/sign-in");
        }, 1500);
      } else {
        setMessage(response?.message || "Unable to reset password.");
      }
    } catch (error) {
      setMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return <ResetPassword onResetPasswordSubmit={handleResetPassword} />;
};

export default ResetPasswordClient;
