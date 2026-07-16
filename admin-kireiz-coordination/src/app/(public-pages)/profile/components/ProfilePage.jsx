"use client";
import { useMemo, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Upload from "@/components/ui/Upload";
import Input from "@/components/ui/Input";
import Select, { Option as DefaultOption } from "@/components/ui/Select";
import Avatar from "@/components/ui/Avatar";
import { Form, FormItem } from "@/components/ui/Form";
import NumericInput from "@/components/shared/NumericInput";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { countryList } from "@/constants/countries.constant";
import { components } from "react-select";
import {
  apiGetSettingsProfile,
  apiUpdateSettingsProfile,
} from "@/services/AccontsService";
import sleep from "@/utils/sleep";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import useSWR from "swr";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { HiOutlineUser } from "react-icons/hi";
import { TbPlus } from "react-icons/tb";
import { CiUser } from "react-icons/ci";

const { Control } = components;

const validationSchema = z.object({
  firstName: z
    .string({
      required_error: "First name is required",
    })
    .trim()
    .min(1, "First name is required"),

  lastName: z
    .string({
      required_error: "Last name is required",
    })
    .trim()
    .min(1, "Last name is required"),

  email: z
    .string({
      required_error: "Email is required",
    })
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),

  dialCode: z
    .string({
      required_error: "Country code is required",
    })
    .min(1, "Country code is required"),

  phoneNumber: z
    .string({
      required_error: "Phone number is required",
    })
    .trim()
    .min(1, "Phone number is required"),

  position: z
    .string({
      required_error: "Position is required",
    })
    .trim()
    .min(1, "Position is required"),

  img: z.string().optional(),
});

const CustomSelectOption = (props) => {
  return (
    <DefaultOption
      {...props}
      customLabel={(data, label) => (
        <span className="flex items-center gap-2">
          <Avatar
            shape="circle"
            size={20}
            src={`/img/countries/${data.value}.png`}
          />
          {props.variant === "country" && <span>{label}</span>}
          {props.variant === "phone" && <span>{data.dialCode}</span>}
        </span>
      )}
    />
  );
};

const CustomControl = ({ children, ...props }) => {
  const selected = props.getValue()[0];
  return (
    <Control {...props}>
      {selected && (
        <Avatar
          className="ltr:ml-4 rtl:mr-4"
          shape="circle"
          size={20}
          src={`/img/countries/${selected.value}.png`}
        />
      )}
      {children}
    </Control>
  );
};

const ProfilePage = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const [imageError, setImageError] = useState("");

  const { data, mutate } = useSWR(
    "/api/settings/profile/",
    () => apiGetSettingsProfile(accessToken),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    },
  );

  const dialCodeList = useMemo(() => {
    const newCountryList = JSON.parse(JSON.stringify(countryList));

    return newCountryList.map((country) => {
      country.label = country.dialCode;
      return country;
    });
  }, []);

  // const beforeUpload = (files) => {
  //   let valid = true;

  //   const allowedFileType = ["image/jpeg", "image/png"];
  //   if (files) {
  //     const fileArray = Array.from(files);
  //     for (const file of fileArray) {
  //       if (!allowedFileType.includes(file.type)) {
  //         valid = "Please upload a .jpeg or .png file!";
  //       }
  //     }
  //   }

  //   return valid;
  // };
  const beforeUpload = (files) => {
    const allowedFileType = ["image/jpeg", "image/png"];
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

    const file = files?.[0];
    if (!file) return false;

    if (!allowedFileType.includes(file.type)) {
      setImageError("Please upload only JPG or PNG images.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setImageError("Image size should not exceed 2 MB.");
      return false;
    }

    setImageError("");
    return true;
  };

  const {
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    control,
  } = useForm({
    resolver: zodResolver(validationSchema),
  });

  useEffect(() => {
    if (data?.data) {
      const profile = data.data;

      const nameParts = profile.name?.trim().split(" ") || [];

      reset({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: profile.email || "",
        phoneNumber: profile.mobile || "",
        position: profile.role_name || "",
        dialCode: "+91", // ya API se aaye to wahi use karo
        img: profile.profile_image || "",
      });
    }
  }, [data, reset]);

  const onSubmit = async (values) => {
    try {
      const payload = {
        name: `${values.firstName} ${values.lastName}`.trim(),
        email: values.email,
        mobile: values.phoneNumber,
        language: "en",
      };

      console.log("Payload:", payload);

      const res = await apiUpdateSettingsProfile(accessToken, payload);
      toast.push(
        <Notification title="Success" type="success">
          {res?.message}
        </Notification>,
      );

      if (res?.data?.status) {
        mutate(); // profile dobara fetch ho jayegi
        console.log("Profile updated successfully");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="bg-white md:p-6 p-3 rounded-2xl  max-w-7xl mx-auto shadow-md mt-3">
        <h4 className="mb-8 text-[#003562] text-lg font-semibold">
          Personal information
        </h4>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8">
            <Controller
              name="img"
              control={control}
              render={({ field }) => (
                <div className="flex items-center sm:flex-row flex-col  justify-center sm:justify-start gap-4 p-5 bg-[#1C4FA81F] rounded-lg">
                  <Avatar
                    size={100}
                    className="border-1 border-white bg-gray-100 text-gray-300 shadow-lg"
                    icon={<CiUser />}
                    src={field.value}
                  />
                  <div className="flex    flex-col sm:items-start items-center gap-2 flex-wrap">
                    <div className="flex items-center  gap-2">
                      <Upload
                        showList={false}
                        uploadLimit={1}
                        beforeUpload={beforeUpload}
                        onChange={(files) => {
                          if (files.length > 0) {
                            field.onChange(URL.createObjectURL(files[0]));
                          }
                        }}
                      >
                        <Button
                          variant="solid"
                          size="sm"
                          type="button"
                          // icon={<TbPlus />}
                          className=" bg-[#1C4FA8] hover:bg-[#1C4FA8] text-white py-2 rounded-md px-6"
                        >
                          Upload Image
                        </Button>
                      </Upload>
                      <Button
                        size="sm"
                        type="button"
                        className="border px-6 py-2 rounded-md"
                        onClick={() => {
                          field.onChange("");
                          setImageError("");
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                    <p className="text-[#5175B2] text-center text-xs">
                      Recommended: 500x500px, JPG/PNG
                    </p>
                    {imageError && (
                      <p className="text-red-500 text-xs mt-1">{imageError}</p>
                    )}
                  </div>
                </div>
              )}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <FormItem
              label="First name"
              invalid={Boolean(errors.firstName)}
              errorMessage={errors.firstName?.message}
            >
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    autoComplete="off"
                    placeholder="First Name"
                    {...field}
                  />
                )}
              />
            </FormItem>
            <FormItem
              label="Last name"
              invalid={Boolean(errors.lastName)}
              errorMessage={errors.lastName?.message}
            >
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    autoComplete="off"
                    placeholder="Last Name"
                    {...field}
                  />
                )}
              />
            </FormItem>
          </div>
          <FormItem
            label="Email"
            invalid={Boolean(errors.email)}
            errorMessage={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  type="email"
                  autoComplete="off"
                  placeholder="Email"
                  {...field}
                />
              )}
            />
          </FormItem>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-end gap-4 w-full">
              <FormItem
                invalid={
                  Boolean(errors.phoneNumber) || Boolean(errors.dialCode)
                }
              >
                <label className="form-label mb-2">Phone number</label>
                <Controller
                  name="dialCode"
                  control={control}
                  render={({ field }) => (
                    <Select
                      instanceId="dial-code"
                      options={dialCodeList}
                      {...field}
                      className="w-[150px] border border-gray-300 rounded-md"
                      components={{
                        Option: (props) => (
                          <CustomSelectOption variant="phone" {...props} />
                        ),
                        Control: CustomControl,
                      }}
                      placeholder=""
                      value={dialCodeList.filter(
                        (option) => option.dialCode === field.value,
                      )}
                      onChange={(option) => field.onChange(option?.dialCode)}
                    />
                  )}
                />
              </FormItem>
              <FormItem
                className="w-full"
                invalid={
                  Boolean(errors.phoneNumber) || Boolean(errors.dialCode)
                }
                errorMessage={errors.phoneNumber?.message}
              >
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <NumericInput
                      autoComplete="off"
                      placeholder="Phone Number"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </FormItem>
            </div>
            <FormItem
              label="Position"
              invalid={Boolean(errors.position)}
              errorMessage={errors.position?.message}
            >
              <Controller
                name="position"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    autoComplete="off"
                    placeholder="Position"
                    {...field}
                  />
                )}
              />
            </FormItem>
          </div>
          <div className="flex justify-end gap-4">
            <Button
              variant="default"
              type="button"
              size="sm"
              className="border px-6 py-2 rounded-md"
            >
              Cancel
            </Button>
            <Button
              // variant="solid"
              type="submit"
              size="sm"
              loading={isSubmitting}
              className="bg-[#1C4FA8] hover:bg-[#1C4FA8] px-6 text-white py-2 rounded-md"
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default ProfilePage;
