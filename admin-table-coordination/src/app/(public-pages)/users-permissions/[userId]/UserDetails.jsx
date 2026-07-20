"use client";

import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

const UserDetails = ({ userId }) => {
  const router = useRouter();

  if (!userId) {
    return <div className="p-6">User not found.</div>;
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#EDE0D7] bg-white text-[#6F6058]"
        >
          <FiArrowLeft size={12} />
        </button>

        <h1 className="text-[30px] font-semibold leading-tight text-[#2A211D]">
          Users Details
        </h1>
      </div>

      <div className="mt-5 rounded-2xl border border-[#F1E5DC] bg-white p-6">
        <div className="grid gap-6 md:grid-cols-4">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B7A39A]">
              Full Name
            </p>
            <p className="mt-2 text-[13px] font-medium text-[#3C302B]">
              Esther Howard
            </p>
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B7A39A]">
              User Type
            </p>
            <div className="mt-2">
              <span className="rounded px-2 py-0.5 text-[9px] font-medium bg-[#EAF4FF] text-[#4B93D4]">
                B2C
              </span>
            </div>
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B7A39A]">
              Email
            </p>
            <p className="mt-2 text-[13px] font-medium text-[#3C302B]">
              Georgia.Young@Example.Com
            </p>
          </div>

          <div className="md:text-right">
            <span className="inline-flex rounded-full bg-[#E8FAF2] px-3 py-1 text-[11px] font-medium text-[#007A55]">
              Active
            </span>
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B7A39A]">
              Phone Number
            </p>
            <p className="mt-2 text-[13px] font-medium text-[#3C302B]">
              (704) 555-0127
            </p>
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B7A39A]">
              Registration Date
            </p>
            <p className="mt-2 text-[13px] font-medium text-[#3C302B]">
              26 May 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
