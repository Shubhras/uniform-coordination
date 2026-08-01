"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { FormItem, Form } from "@/components/ui/Form";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const validationSchema = z.object({
  email: z
    .string({ required_error: "Please enter your email" })
    .min(1, { message: "Please enter your email" })
    .email({ message: "Please enter a valid email address" }),
});

const ForgotPasswordForm = (props) => {
  const [isSubmitting, setSubmitting] = useState(false);

  const {
    className,
    onForgotPasswordSubmit,
    setMessage,
    setEmailSent,
    emailSent,
    children,
  } = props;

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: zodResolver(validationSchema),
  });

  const onForgotPassword = async (values) => {
    if (onForgotPasswordSubmit) {
      onForgotPasswordSubmit({
        values,
        setSubmitting,
        setMessage,
        setEmailSent,
      });
    }
  };

  return (
    <div className={className}>
      {!emailSent ? (
        <Form onSubmit={handleSubmit(onForgotPassword)}>
          <FormItem
            invalid={Boolean(errors.email)}
            errorMessage={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  type="text"
                  placeholder="Email"
                  autoComplete="off"
                  {...field}
                />
              )}
            />
          </FormItem>
          <Button
            block
            loading={isSubmitting}
            variant="solid"
            type="submit"
            className="bg-[#A0522D] hover:bg-[#A0522D] text-white"
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

export default ForgotPasswordForm;
