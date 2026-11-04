"use client";
import { useState, useEffect } from "react";
import ResetPassword from "@/components/auth/ResetPassword";
import { apiResetPassword, apiVerifyResetToken } from "@/services/AuthService";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";

const ResetPasswordClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId =
    searchParams.get("user_id") ||
    searchParams.get("userId") ||
    searchParams.get("uid");
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      if (!userId || !token) {
        setIsExpired(true);
        setErrorMessage(
          "Invalid or expired reset link. Please request a new password reset."
        );
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await apiVerifyResetToken({
          user_id: Number(userId) || userId,
          token: token,
        });

        if (res?.status === true || res?.statusCode === 200) {
          setIsExpired(false);
        } else {
          setIsExpired(true);
          setErrorMessage(
            res?.message ||
            "Invalid or expired reset link. Please request a new password reset."
          );
        }
      } catch (error) {
        // Backend returns 400 (Bad Request) or 401 (Unauthorized) when token is expired or invalid
        const httpStatus = error?.response?.status;
        const errMsg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Invalid or expired reset link. Please request a new password reset.";

        if (httpStatus === 400 || httpStatus === 401 || httpStatus === 403) {
          setIsExpired(true);
          setErrorMessage(errMsg);
        } else {
          setIsExpired(true);
          setErrorMessage(errMsg);
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [userId, token]);

  const handleResetPassword = async (payload) => {
    const { values, setSubmitting, setMessage, setResetComplete } = payload;
    try {
      setSubmitting(true);
      if (!userId || !token) {
        setIsExpired(true);
        setErrorMessage(
          "Invalid or expired reset link. Please request a new password reset."
        );
        return;
      }

      const response = await apiResetPassword({
        user_id: Number(userId) || userId,
        token: token,
        new_password: values.newPassword,
        confirm_password: values.confirmPassword,
      });

      if (response?.status === true || response?.statusCode === 200) {
        toast.push(
          <Notification title="Password reset successful!" type="success">
            {response?.message || "You can now login with your new password"}
          </Notification>
        );
        setResetComplete?.(true);
        setTimeout(() => {
          router.push("/sign-in");
        }, 1500);
      } else {
        const msg = response?.message || "Unable to reset password.";
        if (
          msg.toLowerCase().includes("expired") ||
          msg.toLowerCase().includes("invalid") ||
          msg.toLowerCase().includes("token")
        ) {
          setIsExpired(true);
          setErrorMessage(msg);
        } else {
          setMessage(msg);
        }
      }
    } catch (error) {
      // Check 400 (Bad Request) or 401 (Unauthorized) on submit
      const httpStatus = error?.response?.status;
      const errMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong. Please try again.";

      if (
        httpStatus === 400 ||
        httpStatus === 401 ||
        errMsg.toLowerCase().includes("expired") ||
        errMsg.toLowerCase().includes("invalid") ||
        errMsg.toLowerCase().includes("token")
      ) {
        setIsExpired(true);
        setErrorMessage(
          errMsg.toLowerCase().includes("expired") || errMsg.toLowerCase().includes("invalid")
            ? errMsg
            : "Invalid or expired reset link. Please request a new password reset."
        );
      } else {
        setMessage(errMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ResetPassword
      isLoading={isLoading}
      isExpired={isExpired}
      errorMessage={errorMessage}
      onResetPasswordSubmit={handleResetPassword}
    />
  );
};

export default ResetPasswordClient;

