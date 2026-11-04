
"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGetBlogDetail } from "@/services/BlogService";

/**
 * Formats an ISO date string into YYYY-MM-DD format.
 *
 * @param {string} date - ISO date string to format.
 * @returns {string} Formatted date string.
 */
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

/**
 * SingleBlogSection Component.
 * Fetches and displays full blog article details (title, date, hero image, and HTML description) based on blog ID from URL params.
 *
 * @returns {JSX.Element} Single blog article detail view section.
 */
const SingleBlogSection = () => {
  const { id } = useParams();
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    /**
     * Fetches detailed blog article data by ID.
     */
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await apiGetBlogDetail(id);
        if (res?.status) {
          setBlogData({
            img: res?.data?.image_url,
            title: res?.data?.title,
            date: formatDate(res?.data?.created_at),
            description: res?.data?.description,
          });
        }
      } catch (err) {
        console.error("Failed to load blog detail", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBlog();
  }, [id]);

  return (
    <section className="relative w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12 py-20 md:py-24">
      <div className="bg-[#F5F7FB] rounded-3xl px-1 md:px-10 lg:px-8 py-10 md:py-8">

        {/* HEADER */}
        <div className="text-center lg:mb-7 md:mb-10">
          <div className="text-center mb-1">
            <div className="inline-flex flex-col items-end">
              <h1 className="text-2xl lg:text-3xl font-semibold text-[#1C2C56] leading-snug">
                {blogData?.title || ""}
              </h1>
              <div className="w-[40px] md:w-[40px] h-[3px] bg-[#87CEEB] mt-2" />
            </div>
          </div>
        </div>

        {/* Blog Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C4FA8]"></div>
          </div>
        ) : !blogData ? (
          <div className="py-20 text-center text-gray-500">
            Blog not found
          </div>
        ) : (
          <div className="w-full bg-[#F5F7FB] rounded-3xl p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

              {/* Left Column: Image */}
              <div className="w-full overflow-hidden rounded-2xl shadow-sm bg-white">
                <Image
                  src={blogData.img}
                  alt={blogData.title}
                  width={900}
                  height={900}
                  className="w-full h-[320px] sm:h-[400px] lg:h-[480px] object-cover object-center rounded-2xl"
                  unoptimized
                />
              </div>

              {/* Right Column: Title, Date & Description */}
              <div className="flex flex-col">
                <div className="flex flex-col gap-2 mb-4 pb-4">
                  {/* <h1 className="text-2xl lg:text-3xl font-semibold text-[#1C2C56] leading-snug">
                    {blogData.title}
                  </h1> */}
                </div>

                {/* Description */}
                <div
                  className="text-gray-700 text-sm md:text-base leading-relaxed space-y-4 border-b border-gray-200 mb-3"
                  dangerouslySetInnerHTML={{ __html: blogData.description }}
                />
                <p className="text-sm text-gray-500 font-medium">
                  {blogData.date}
                </p>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default SingleBlogSection;
