"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { apiGetBlogDetail } from "@/services/BlogService";
import { formatISODate as formatDate } from "@/utils/formatDate";

/**
 * SingleBlogSection Component
 * 
 * Fetches and displays detailed blog article content based on the URL parameter ID.
 */
const SingleBlogSection = () => {
  const { id } = useParams();
  const router = useRouter();
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Fetches single blog article details by blog ID.
   */
  useEffect(() => {
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
        // Silently handle fetch error
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBlog();
  }, [id]);

  return (
    <section className="relative w-full bg-white mx-auto px-4 sm:px-6 md:px-8 lg:px-12 mt-15 py-8 md:py-12">
      <div>
        {/* Back / Breadcrumbs Navigation */}
        <div className="flex items-center gap-2 mb-4 sm:mb-6 text-sm text-[#7B3C1D]">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-[#7B3C1D] hover:text-[#1C4FA8] transition-colors p-1 cursor-pointer flex items-center"
            title="Go back"
          >
            <FiArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href="/table-form"
              className="hover:underline hover:text-[#1C4FA8] cursor-pointer"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/blog"
              className="hover:underline hover:text-[#1C4FA8] cursor-pointer"
            >
              Blog
            </Link>
            {blogData?.title && (
              <>
                <span>/</span>
                <span className="text-[#7B3C1D]/80 truncate max-w-xs sm:max-w-md">
                  {blogData.title}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Blog Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0522D]"></div>
          </div>
        ) : !blogData ? (
          <div className="py-20 text-center text-gray-500">
            Blog not found
          </div>
        ) : (
          <div className="w-full bg-[#F8F9FC] rounded-3xl p-6 sm:p-10 md:p-12 shadow-xs">
            {/* Title */}
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-block relative">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                  {blogData.title}
                </h1>
                <span className="block w-12 h-[3px] bg-[#60a5fa] rounded-full ml-auto mt-2" />
              </div>
            </div>

            {/* 2-Column Grid: Left Image, Right Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Left Image */}
              <div className="relative w-full h-[280px] sm:h-[360px] md:h-[420px] lg:h-[460px] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                <Image
                  src={blogData.img}
                  alt={blogData.title || "Blog Image"}
                  fill
                  className="object-cover rounded-2xl"
                  unoptimized
                />
              </div>

              {/* Right: Description + Divider + Date */}
              <div className="flex flex-col justify-start">
                <div
                  className="text-gray-600 text-sm sm:text-base leading-relaxed space-y-3"
                  dangerouslySetInnerHTML={{ __html: blogData.description }}
                />
                <div className="border-b border-gray-200/80 my-4 sm:my-5 w-full" />
                <p className="text-xs sm:text-sm text-gray-400 font-normal">
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

