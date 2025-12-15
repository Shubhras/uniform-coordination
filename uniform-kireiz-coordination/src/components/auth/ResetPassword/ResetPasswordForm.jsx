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
              <input
                type="checkbox"
                className="accent-primary cursor-pointer"
              />
              <p>
                I Agree to privacy
                <span className="text-blue-400"> policy & terms</span>
              </p>
            </label>
          </div>
          <Button
            block
            loading={isSubmitting}
            variant="solid"
            type="submit"
            className="bg-[#1C2C56] hover:bg-[#152243] text-white"
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
