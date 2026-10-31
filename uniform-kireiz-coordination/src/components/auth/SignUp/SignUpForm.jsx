"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { FormItem, Form } from "@/components/ui/Form";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PasswordInput from "@/components/shared/PasswordInput";
import PrivacyPolicyPopup from "./PrivacyPolicyPopup";

const validationSchema = z
  .object({
    firstName: z
      .string({ error: "Please enter your first name" })
      .min(1, "Please enter your first name"),
    lastName: z
      .string({ error: "Please enter your last name" })
      .min(1, "Please enter your last name"),
    phone: z
      .string({ required_error: "Please enter your mobile no." })
      .trim()
      .min(1, "Please enter your mobile no.")
      .regex(/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"),
    email: z
      .string({ error: "Please enter your email" })
      .min(1, "Please enter your email")
      .email({ message: "Please enter a valid email address" }),
    password: z
      .string({ error: "Please enter your password" })
      .min(1, "Please enter your password")
      .min(8, "Password must be at least 8 characters")
      .regex(/[^A-Za-z0-9]/, "Must include a symbol"),
  })


const SignUpForm = (props) => {
  const { onSignUp, className, setMessage, termConditionHint } = props;

  const [isSubmitting, setSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [dialogPrivacyOpen, setDialogPrivacyOpen] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(validationSchema),
  });

  const watchedFirstName = watch("firstName");
  const watchedLastName = watch("lastName");
  const watchedPhone = watch("phone");
  const watchedEmail = watch("email");
  const watchedPassword = watch("password");

  const isFormValid = Boolean(
    watchedFirstName?.trim() &&
    watchedLastName?.trim() &&
    watchedPhone?.trim()?.length === 10 &&
    watchedEmail?.trim() &&
    watchedPassword &&
    agreedToTerms
  );

  const handleSignUp = async (values) => {
    if (onSignUp) {
      onSignUp({ values, setSubmitting, setMessage });
    }
  };


  return (
    <div className={className}>
      <Form onSubmit={handleSubmit(handleSignUp)}>
        <FormItem
          invalid={Boolean(errors.firstName)}
          errorMessage={errors.firstName?.message}
        >
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <Input
                type="text"
                placeholder="First Name"
                autoComplete="off"
                {...field}
              />
            )}
          />
        </FormItem>
        <FormItem
          invalid={Boolean(errors.lastName)}
          errorMessage={errors.lastName?.message}
        >
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <Input
                type="text"
                placeholder="Last Name"
                autoComplete="off"
                {...field}
              />
            )}
          />
        </FormItem>
        <FormItem
          invalid={Boolean(errors.phone)}
          errorMessage={errors.phone?.message}
        >
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Mobile no."
                autoComplete="tel"
                maxLength={10}
                {...field}
                value={field.value || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  field.onChange(value);
                }}
                onKeyDown={(e) => {
                  if (
                    e.key &&
                    e.key.length === 1 &&
                    !/\d/.test(e.key) &&
                    !e.ctrlKey &&
                    !e.metaKey
                  ) {
                    e.preventDefault();
                  }
                }}
              />
            )}
          />
        </FormItem>

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
        <FormItem
          invalid={Boolean(errors.password)}
          errorMessage={errors.password?.message}
        >
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <PasswordInput
                type="text"
                placeholder="Password"
                autoComplete="off"
                {...field}
              />
            )}
          />
        </FormItem>
        {termConditionHint ? (
          termConditionHint
        ) : (
          <div className="mb-6 mt-0 flex justify-between items-center">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div className="relative w-5 h-5 shrink-0 flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded bg-white checked:bg-[#003562] checked:border-[#003562] cursor-pointer transition-all m-0"
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
                I Agree to
                <span
                  role="button"
                  tabIndex={0}
                  className="text-[#87CEEB] hover:underline cursor-pointer ml-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDialogPrivacyOpen(true);
                  }}
                >
                  Privacy Policy
                </span>
              </p>
            </label>
          </div>
        )}
        <Button
          block
          loading={isSubmitting}
          disabled={!isFormValid || isSubmitting}
          variant="solid"
          type="submit"
          className="bg-[#1C2C56] hover:bg-[#152243] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </Form>
      <PrivacyPolicyPopup
        isOpen={dialogPrivacyOpen}
        onClose={() => setDialogPrivacyOpen(false)}
        onAgree={() => setAgreedToTerms(true)}
      />
    </div>
  );
};

export default SignUpForm;