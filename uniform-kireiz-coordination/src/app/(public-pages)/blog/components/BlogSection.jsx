"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGetBlogs } from "@/services/BlogService";

/**
 * Trims text to a given number of words and adds "..." if it exceeds the limit.
 */
const trimText = (text, wordLimit = 10) => {
  if (!text) return "";
  const words = text.split(" ");
  return words.length > wordLimit
    ? words.slice(0, wordLimit).join(" ") + "..."
    : text;
};

/**
 * Formats a date value into YYYY-MM-DD format.
 */
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

/**
 * BlogSection Component
 *
 * Fetches blog posts from the API and displays them in a grid.
 * Handles loading state, empty state, and navigates to the
 * single blog details page when a card is clicked.
 */
const BlogSection = () => {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Navigates to the single blog details page for the clicked blog.
   */
  const handleClick = (id) => {
    router.push(`/single-blog/${id}`);
  };

  useEffect(() => {
    /**
     * Fetches blogs from the API and maps the response into
     * the format required for rendering.
     */
    const fetchBlogs = async () => {
      try {
        const response = await apiGetBlogs();
        if (response?.status) {
          const mapped = response.data.map((post) => ({
            id: post.id,
            slug: post.slug,
            image: post.image_url || "/img/placeholder.png",
            date: formatDate(post.created_at),
            category: post.categoryName || "Category",
            title: post.title,
            desc: post.description,
          }));
          setBlogs(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch blogs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <section className="w-full bg-white px-5 md:px-8 lg:px-12 py-20 md:py-24">
      <div className="bg-[#F5F7FB] rounded-3xl px-4 md:px-10 lg:px-8 py-10 md:py-8">
        <div className="text-center mb-10">
          <h2 className="text-[#1C2C56] lg:text-4xl text-3xl font-semibold">
            Blog
          </h2>
          <div className="w-24 h-1 rounded-full bg-[#87CEEB] mx-auto mt-2" />
          <p className="text-[#6B7280] text-sm mt-4 max-w-xl mx-auto">
            Read our latest updates and insights
          </p>
        </div>
        <h2 className="mb-5 lg:text-3xl text-3xl font-semibold text-[#1C2C56]">
          Our Latest Blog Posts
        </h2>
        {loading ? <section className="relative w-full bg-white mx-auto px-5 md:px-8 lg:px-12 mt-15">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C4FA8]"></div>
          </div>
        </section> : null}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {blogs.map((post, index) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
              onClick={() => handleClick(post.id)}
            >
              <div className="p-3">
                <Image
                  src={post.image}
                  alt={post.title || "Blog Image"}
                  width={500}
                  height={300}
                  className="rounded-xl object-cover object-top w-full h-[200px]"
                  unoptimized
                />
              </div>
              <div className="px-5 pb-6 flex flex-col gap-3">
                <p className="text-xs text-gray-500 mb-2">
                  {post.date} &nbsp;&nbsp; {post.category}
                </p>
                <h3 className="font-semibold text-[#1C2C56] text-base leading-snug">
                  {trimText(post.title, 10)}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {trimText(post.desc, 15)}
                </p>
              </div>
            </div>
          ))}
        </div>
        {!loading && blogs.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            No blogs available
          </p>
        )}
      </div>
    </section>
  );
};

export default BlogSection;