"use client";

import { useEffect, useState } from "react";
import { FiArrowLeft, FiUpload } from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiGetCustomersDetails,
  apiUpdateCustomer,
} from "@/services/B2BAccountService";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";

const EditCustomer = () => {
  const router = useRouter();
  const { id } = useParams();

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required*";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required*";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required*";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required*";
    }

    if (!formData.userType) {
      newErrors.userType = "User type is required*";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required*";
    }

    if (!formData.language) {
      newErrors.language = "Language is required*";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const [formData, setFormData] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    userType: "",
    gender: "",
    language: "",
    is_verify: false,
    isActive: true,
    email_notifications: true,
    push_notifications: false,
    profileImage: null,
  });

  const getCustomerDetails = async () => {
    try {
      setLoading(true);

      const res = await apiGetCustomersDetails(accessToken, id);

      if (res?.status) {
        const data = res.data;

        setFormData({
          userName: data.userName || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          userType: data.userType || "",
          gender: data.gender || "",
          language: data.language || "",
          is_verify: data.is_verify,
          isActive: data.isActive,
          email_notifications: data.email_notifications,
          push_notifications: data.push_notifications,
          profileImage: null,
        });

        setPreview(data.profileImage || "");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && id) {
      getCustomerDetails();
    }
  }, [accessToken, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      profileImage: file,
    }));

    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    if (!validateForm()) return;

    e.preventDefault();

    try {
      setSubmitLoading(true);

      const payload = new FormData();

      payload.append("userName", formData.userName);
      payload.append("firstName", formData.firstName);
      payload.append("lastName", formData.lastName);
      payload.append("email", formData.email);
      payload.append("phone", formData.phone);
      payload.append("userType", formData.userType);
      payload.append("gender", formData.gender);
      payload.append("language", formData.language);

      payload.append("is_verify", formData.is_verify ? "true" : "false");

      payload.append("isActive", formData.isActive ? "true" : "false");

      payload.append(
        "email_notifications",
        formData.email_notifications ? "true" : "false",
      );

      payload.append(
        "push_notifications",
        formData.push_notifications ? "true" : "false",
      );

      if (formData.profileImage) {
        payload.append("profileImage", formData.profileImage);
      }

      const res = await apiUpdateCustomer(accessToken, id, payload);

      if (res?.status) {
        toast.push(
          <Notification title="Success" type="success">
            {res?.message || "Customer updated successfully"}
          </Notification>,
        );

        router.push("/customer");
      }
    } catch (error) {
      console.log(error);

      toast.push(
        <Notification title="Error" type="danger">
          {error?.response?.data?.message || "Failed to update customer"}
        </Notification>,
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  //   if (loading) {
  //     return (
  //       <div className="flex justify-center items-center h-[400px]">
  //         <p className="text-lg font-medium">Loading...</p>
  //       </div>
  //     );
  //   }

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6">
      {/* Header */}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full border border-gray-300 bg-white flex items-center justify-center"
          >
            <FiArrowLeft />
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-[#1C2C56]">
              Edit Customer
            </h1>

            <p className="text-gray-500 text-sm">Update customer details</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Profile Image */}

        <div className="flex items-center gap-6 mb-8">
          {/* Profile Image */}
          <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-gray-300">
            {preview ? (
              <img
                src={preview}
                alt="profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-100 text-3xl font-semibold text-[#1C4FA8]">
                {formData.firstName?.charAt(0) || "U"}
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div>
            <label className="cursor-pointer bg-[#1C4FA8] text-white px-5 py-2.5 rounded-md flex items-center gap-2 text-sm w-fit hover:bg-[#163d84] transition">
              <FiUpload size={16} />
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImage}
              />
            </label>

            <p className="text-xs text-gray-500 mt-2">JPG, PNG up to 2MB</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium">Username</label>

            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">First Name</label>

            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Last Name</label>

            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Phone</label>

            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">User Type</label>

            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            >
              <option value="">Select</option>
              <option value="uniform">Uniform</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
            </select>
            {errors.userType && (
              <p className="text-red-500 text-xs mt-1">{errors.userType}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Gender</label>

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Language</label>

            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
            </select>
          </div>
        </div>

        {/* Switches */}

        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_verify"
              checked={formData.is_verify}
              onChange={handleChange}
            />
            Email Verified
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            Active
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="email_notifications"
              checked={formData.email_notifications}
              onChange={handleChange}
            />
            Email Notifications
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="push_notifications"
              checked={formData.push_notifications}
              onChange={handleChange}
            />
            Push Notifications
          </label>
        </div>

        {/* Buttons */}

        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitLoading}
            className="bg-[#1C4FA8] text-white px-6 py-2 rounded-lg"
          >
            {submitLoading ? "Updating..." : "Update Customer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCustomer;
