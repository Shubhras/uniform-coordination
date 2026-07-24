"use client";

import { FiUpload, FiImage } from "react-icons/fi";

const GeneralSettings = () => {
  return (
    <div className="min-h-screen mt-5">
      <div className="rounded-[24px] border border-[#E8DDD4] bg-white p-5 shadow-sm">
        {/* Form */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Company */}
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">
              Company Name
            </label>

            <input
              className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none focus:border-[#B86A3C]"
              defaultValue="KIREIZ SPACE Co., Ltd."
            />
          </div>

          {/* Address */}

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">
              Business Address
            </label>

            <input
              className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none focus:border-[#B86A3C]"
              defaultValue="1-2-3 Minami-Aoyama..."
            />
          </div>

          {/* Email */}

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">
              Support Email
            </label>

            <select className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none">
              <option>support@kireizspace.jp</option>
            </select>
          </div>

          {/* Contact */}

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">
              Contact Number
            </label>

            <select className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none">
              <option>+81 3-1234-5678</option>
            </select>
          </div>

          {/* Language */}

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">
              Defualt Language
            </label>

            <select className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none">
              <option>Japanese</option>
            </select>
          </div>

          {/* Currency */}

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">
              Default Currency
            </label>

            <select className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none">
              <option>JPY (¥)</option>
            </select>
          </div>

          {/* Timezone */}

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">
              Time Zone
            </label>

            <select className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none">
              <option>(GMT+09:00) Tokyo</option>
            </select>
          </div>

          {/* Date */}

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#8C6E5D]">
              Date Format
            </label>

            <select className="h-10 w-full rounded-xl border border-[#E9DDD4] bg-[#FFFCFB] px-4 text-sm outline-none">
              <option>YYYY/MM/DD</option>
            </select>
          </div>
        </div>

        {/* Upload */}

        <div className="mt-8">
          <label className="mb-2 block text-[13px] text-[#8C6E5D] font-semibold">
            Logo
          </label>

          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#E6D4C8] bg-[#FFFDFC]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5E6DA]">
              <FiImage size={22} className="text-[#A0522D]" />
            </div>

            <h5 className="mt-4 font-medium">Upload Logo</h5>

            <p className="mt-1 text-sm">PNG or JPG up to 5 MB</p>

            <button className="mt-5 rounded-full border border-[#A85A32] px-6 py-2 text-sm font-medium text-[#A85A32] transition">
              Browse Files
            </button>
          </div>
        </div>

        {/* Footer */}

        <div className="mt-10 flex justify-end gap-4">
          <button className="rounded-xl border border-[#E8DDD4] bg-white px-8 py-3 font-medium text-[#6E5A4D]">
            Cancel
          </button>

          <button className="rounded-xl bg-[#A85A32] px-6 py-1 font-medium text-white hover:bg-[#A85A32]">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
