
"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGetBlogDetail } from "@/services/BlogService";

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

const SingleBlogSection = () => {
  const { id } = useParams();
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(false);

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
        console.error("Failed to load blog detail", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBlog();
  }, [id]);

  if (!blogData) {
    return (
      <section className="relative w-full bg-white mx-auto px-5 md:px-8 lg:px-12 mt-15">
        <div className="py-20 text-center text-gray-500">
          Blog not found
        </div>
      </section>
    );
  }
  return (
    <section className="relative w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12 py-20 md:py-24">
      <div className="bg-[#F5F7FB] rounded-3xl px-1 md:px-10 lg:px-8 py-10 md:py-8">

        {/* HEADER */}
        <div className="text-center lg:mb-24 md:mb-18 mb-10">
          <div className="text-center mb-6">
            <div className="inline-flex flex-col items-end">
              <h2 className="text-[#1C2C56] lg:text-4xl text-3xl font-semibold">
                Blog
              </h2>
              <div className="w-[40px] md:w-[40px] h-[3px] bg-[#87CEEB] mt-2" />
            </div>
          </div>
          <p className="text-[#6B7280] text-sm mt-4 max-w-xl mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          </p>
        </div>

        <h2 className="text-center mb-5 lg:text-3xl text-3xl font-semibold text-[#1C2C56]">
          Our Latest Blog Posts
        </h2>

        {/* Blog Content */}
        {
          loading ? <section className="relative w-full bg-white mx-auto px-5 md:px-8 lg:px-12 mt-15">
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C4FA8]"></div>
            </div>
          </section> :
            <div className="w-full bg-[#F5F7FB] rounded-3xl p-3">

              {/* Image */}
              <div className="mb-6">
                <Image
                  src={blogData.img}
                  alt={blogData.title}
                  width={900}
                  height={450}
                  className="w-full lg:h-[600px] lg:object-cover object-contain rounded-2xl"
                  unoptimized
                />
              </div>

              {/* Title + Date */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h1 className="text-2xl md:text-2xl font-semibold text-[#1C2C56]">
                  {blogData.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {blogData.date}
                </p>
              </div>

              {/* Description */}
              <div
                className="text-gray-700 text-sm md:text-base leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: blogData.description }}
              />
            </div>
        }
      </div>
    </section>
  );
};

export default SingleBlogSection;
