"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { FormItem, Form } from "@/components/ui/Form";
import PasswordInput from "@/components/shared/PasswordInput";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const passwordComplexityRegex = {
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/,
};

const validationSchema = z
  .object({
    newPassword: z
      .string({ required_error: "Please enter your password" })
      .min(1, "Password is required")
      .min(12, "Password must be at least 12 characters long")
      .refine((val) => passwordComplexityRegex.upper.test(val), {
        message: "Password must contain at least one uppercase letter (A-Z)",
      })
      .refine((val) => passwordComplexityRegex.lower.test(val), {
        message: "Password must contain at least one lowercase letter (a-z)",
      })
      .refine((val) => passwordComplexityRegex.number.test(val), {
        message: "Password must contain at least one number (0-9)",
      })
      .refine((val) => passwordComplexityRegex.special.test(val), {
        message:
          "Password must contain at least one special character (!@#$%^&* etc.)",
      }),
    confirmPassword: z
      .string({
        required_error: "Confirm Password Required",
      })
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Your passwords do not match",
    path: ["confirmPassword"],
  });

const ResetPasswordForm = (props) => {
  const [isSubmitting, setSubmitting] = useState(false);

  const {
    className,
    setMessage,
    setResetComplete,
    resetComplete,
    onResetPasswordSubmit,
    children,
  } = props;

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleResetPassword = async (values) => {
    if (onResetPasswordSubmit) {
      onResetPasswordSubmit({
        values,
        setSubmitting,
        setMessage,
        setResetComplete,
      });
    }
  };

  return (
    <div className={className}>
      {!resetComplete ? (
        <Form onSubmit={handleSubmit(handleResetPassword)}>
          <FormItem
            invalid={Boolean(errors.newPassword)}
            errorMessage={errors.newPassword?.message}
          >
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  autoComplete="off"
                  placeholder="New Password"
                  {...field}
                />
              )}
            />
            <p className="text-[12px] text-gray-400 mt-1.5 leading-normal">
              Min 12 characters with uppercase, lowercase, numbers & special characters.
            </p>
          </FormItem>
          <FormItem
            invalid={Boolean(errors.confirmPassword)}
            errorMessage={errors.confirmPassword?.message}
          >
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  autoComplete="off"
                  placeholder="Confirm Password"
                  {...field}
                />
              )}
            />
          </FormItem>
          <div className="mb-6 mt-2 flex justify-between items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative w-5 h-5 shrink-0 flex items-center justify-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded bg-white checked:bg-[#A0522D] checked:border-[#A0522D] cursor-pointer transition-all m-0"
                />
                <svg
                  className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-sm text-[#4C4E64AD]">
                I Agree to privacy{" "}
                <span className="text-[#A0522D] font-medium">policy & terms</span>
              </p>
            </label>
          </div>
          <Button
            block
            loading={isSubmitting}
            variant="solid"
            type="submit"
            className="bg-[#A0522D] hover:bg-[#8B4513] text-white"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Form>
      ) : (
        <>{children}</>
      )}
    </div>
  );
};

export default ResetPasswordForm;
