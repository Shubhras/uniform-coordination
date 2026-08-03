"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { FormItem, Form } from "@/components/ui/Form";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PasswordInput from "@/components/shared/PasswordInput";

const validationSchema = z
  .object({
    firstName: z
      .string({ required_error: "Please enter your first name" })
      .min(1, "Please enter your first name"),
    lastName: z
      .string({ required_error: "Please enter your last name" })
      .min(1, "Please enter your last name"),
    phone: z
      .string({ required_error: "Please enter your mobile no." })
      .min(1, "Please enter your mobile no.")
      .regex(/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"),
    email: z
      .string({ required_error: "Please enter your email" })
      .min(1, "Please enter your email")
      .email({ message: "Please enter a valid email address" }),
    password: z
      .string({ required_error: "Password Required" })
      .min(1, "Password Required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[^A-Za-z0-9]/, "Must include a symbol"),
  })


const SignUpForm = (props) => {
  const { onSignUp, className, setMessage, termConditionHint } = props;

  const [isSubmitting, setSubmitting] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: zodResolver(validationSchema),
  });
  console.log(errors)

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
                type="number"
                placeholder="Mobile no."
                autoComplete="off"
                {...field}
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
        {termConditionHint}
        <Button
          block
          loading={isSubmitting}
          variant="solid"
          type="submit"
          className="bg-[#1C2C56] hover:bg-[#152243] text-white"
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </Form>
    </div>
  );
};

export default SignUpForm;