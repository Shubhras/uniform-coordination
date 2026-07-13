"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { FormItem, Form } from "@/components/ui/Form";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PasswordInput from "@/components/shared/PasswordInput";

const validationSchema = z.object({
  // email: z.string({ required_error: "Please enter your email" }),
  // userName: z.string({ required_error: "Please enter your name" }),
  // password: z.string({ required_error: "Password Required" }),

  userName: z.string().trim().min(1, { message: "Please enter your name" }),

  email: z
    .string()
    .trim()
    .min(1, { message: "Please enter your email" })
    .email({ message: "Please enter a valid email" }),

  password: z.string().min(1, { message: "Please enter your password" }),

  // confirmPassword: z.string({
  //   required_error: "Confirm Password Required",
  // }),
});
// .refine((data) => data.password === data.confirmPassword, {
//   message: "Password not match",
//   path: ["confirmPassword"],
// }
// );

const SignUpForm = (props) => {
  const { onSignUp, className, setMessage, termConditionHint } = props;

  const [isSubmitting, setSubmitting] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      userName: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(validationSchema),
  });
  console.log(errors);

  const handleSignUp = async (values) => {
    if (onSignUp) {
      onSignUp({ values, setSubmitting, setMessage });
    }
  };

  return (
    <div className={className}>
      <Form onSubmit={handleSubmit(handleSignUp)}>
        <FormItem
          invalid={Boolean(errors.userName)}
          errorMessage={errors.userName?.message}
        >
          <Controller
            name="userName"
            control={control}
            render={({ field }) => (
              <Input
                type="text"
                placeholder="User Name"
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
            rules={{ required: true }}
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
