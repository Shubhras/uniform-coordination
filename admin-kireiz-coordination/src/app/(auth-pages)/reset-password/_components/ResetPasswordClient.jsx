"use client";
import { useState, useEffect } from "react";
import ResetPassword from "@/components/auth/ResetPassword";
import { apiResetPassword, apiValidateResetToken } from "@/services/AuthService";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";

const ResetPasswordClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("user_id") || searchParams.get("userId");
  const token = searchParams.get("token");

  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const validateToken = async () => {
      if (!userId || !token) {
        if (isMounted) {
          setInitialMessage(
            "Invalid or expired reset link. Please check your email or request a new reset link."
          );
          setIsTokenValid(false);
          setIsValidating(false);
        }
        return;
      }

      try {
        setIsValidating(true);
        const res = await apiValidateResetToken(userId, token);
        if (isMounted) {
          if (res?.status === true || res?.statusCode === 200) {
            setIsTokenValid(true);
            setInitialMessage("");
          } else {
            setIsTokenValid(false);
            setInitialMessage(
              res?.message ||
                "This password reset link has expired or is invalid. Please request a new reset link."
            );
          }
        }
      } catch (err) {
        if (isMounted) {
          setIsTokenValid(false);
          setInitialMessage(
            err?.response?.data?.message ||
              "This password reset link has expired or is invalid. Please request a new reset link."
          );
        }
      } finally {
        if (isMounted) {
          setIsValidating(false);
        }
      }
    };

    validateToken();

    return () => {
      isMounted = false;
    };
  }, [userId, token]);

  const handleResetPassword = async (payload) => {
    const { values, setSubmitting, setMessage, setResetComplete } = payload;
    try {
      setSubmitting(true);
      if (!userId || !token) {
        setMessage(
          "Invalid or expired reset link. Please check your email or request a new reset link."
        );
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

  return (
    <ResetPassword
      isValidating={isValidating}
      isTokenValid={isTokenValid}
      initialMessage={initialMessage}
      onResetPasswordSubmit={handleResetPassword}
    />
  );
};

export default ResetPasswordClient;

