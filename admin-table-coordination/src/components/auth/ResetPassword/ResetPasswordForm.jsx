"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { FormItem, Form } from "@/components/ui/Form";
import PasswordInput from "@/components/shared/PasswordInput";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const validationSchema = z
  .object({
    newPassword: z.string({ required_error: "Please enter your password" }),
    confirmPassword: z.string({
      required_error: "Confirm Password Required",
    }),
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
                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded bg-white checked:bg-[#A85A32] checked:border-[#A85A32] cursor-pointer transition-all m-0"
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
              <p>
                I Agree to privacy
                <span className="text-[#A0522D]"> policy & terms</span>
              </p>
            </label>
          </div>
          <Button
            block
            loading={isSubmitting}
            variant="solid"
            type="submit"
            className="bg-[#A85A32] hover:bg-[#A85A32] text-white"
          >
            {isSubmitting ? "Submiting..." : "Submit"}
          </Button>
        </Form>
      ) : (
        <>{children}</>
      )}
    </div>
  );
};

export default ResetPasswordForm;
