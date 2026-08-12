"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { useRouter } from "next/navigation";

const HeroContent = ({ data }) => {
  const t = useTranslations("dashboard");
  const { session } = useCurrentSession();
  console.log("SESSION =>", session);
  console.log("USER =>", session?.user);
  console.log("ROLE =>", session?.user?.role);
  const router = useRouter();

  // const userName = session?.user?.name || session?.user?.email || "Admin";
  const userName = session?.user?.authority?.[0];

  return (
    <section className="relative w-full px-5 md:px-8 lg:px-8 py-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, #E9D5FF 0%, #DBEAFE 50%, #E0E7FF 100%)",
        }}
      />

      <div className="relative z-10 bg-white rounded-xl shadow-lg p-5 md:p-8 flex flex-col gap-6">
        <div className="flex flex-wrap gap-3">
          <button className="bg-[#6A341A] text-white px-4 py-2 rounded-md text-sm font-medium">
            {t("heroActions.createTheme")}
          </button>

          <button
            className="border border-[#CBD5E1] text-[#1E293B] px-4 py-2 rounded-md text-sm font-medium"
            onClick={() => router.push("/orders")}
          >
            {t("heroActions.viewOrders")}
          </button>

          <button
            className="border border-[#CBD5E1] text-[#1E293B] px-4 py-2 rounded-md text-sm font-medium"
            onClick={() => router.push("/inventory-management/add")}
          >
            {t("heroActions.addNewProduct")}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-semibold text-[#4D2512]">
              {t("welcomeTitle", { name: userName ?? "" })}
            </h1>

            <p className="text-[14px] text-[#4D2512] max-w-md">
              {t("welcomeSubtitle")}
            </p>
          </div>

          <div className="flex justify-center lg:absolute lg:right-5 lg:bottom-0">
            <Image
              src="/img/admin/emoji.png"
              alt={t("dashboardEmojiAlt")}
              width={300}
              height={220}
              priority
              className="object-contain w-[200px] lg:w-[300px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroContent;
