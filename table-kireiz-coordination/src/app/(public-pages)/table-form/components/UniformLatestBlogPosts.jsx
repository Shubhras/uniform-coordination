"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { formatISODate as formatDate } from "@/utils/formatDate";

/**
 * UniformLatestBlogPosts Component
 * 
 * Displays grid of recent blog article cards with navigation links to the main blog catalog and individual post views.
 * 
 * @param {Object} props
 * @param {Array} [props.blogs=[]] - Array of blog post objects.
 * @param {boolean} [props.loading] - Loading state boolean.
 */
const UniformLatestBlogPosts = ({ blogs = [], loading }) => {
  const [cardsPerView, setCardsPerView] = useState(4);
  const router = useRouter();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width >= 1280) {
        setCardsPerView(4); // xl / large desktop
      } else if (width >= 1024) {
        setCardsPerView(3); // lg desktop
      } else if (width >= 640) {
        setCardsPerView(2); // tablet
      } else {
        setCardsPerView(1); // small mobile
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /**
   * Navigates blog carousel forward.
   */
  const handleNext = () => {
    setIndex((prev) => {
      const totalCards = blogs.length;

      if (prev + cardsPerView >= totalCards) {
        return prev;
      }

      return prev + cardsPerView;
    });
  };

  /**
   * Navigates blog carousel backward.
   */
  const handlePrev = () => {
    setIndex((prev) => {
      if (prev === 0) return 0;

      return Math.max(0, prev - cardsPerView);
    });
  };

  /**
   * Truncates text to a word limit.
   */
  const trimText = (text, limit = 15) =>
    text?.split(" ").slice(0, limit).join(" ") + "...";

  /**
   * Redirects to all blogs page.
   */
  const handleAllBlogsPage = () => {
    router.push("/blog");
  };

  /**
   * Redirects to single blog details page.
   * 
   * @param {string|number} id - Target blog ID.
   */
  const handleSingleBlogPage = (id) => {
    router.push(`/single-blog/${id}`);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0522D]"></div>
      </div>
    );

  return (
    <section className="w-full bg-white mx-auto px-5 md:px-8 lg:px-12">
      <div className="py-10 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <h2 className="text-center md:text-left text-3xl font-semibold text-[#402936]">
            Our Latest Blog Posts
          </h2>
          <div className="flex flex-col items-center md:items-end gap-2">
            <button onClick={handleAllBlogsPage} className="border border-[#A0522D] self-center md:self-auto text-[#5D4A4A] px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition cursor-pointer">
              See All Blog Posts
            </button>
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={handlePrev}
                disabled={index === 0}
                className={`${
                  index === 0
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-[#5D4A4A] cursor-pointer"
                }`}
              >
                <FiArrowLeft size={25} />
              </button>

              <button
                onClick={handleNext}
                disabled={index + cardsPerView >= blogs.length}
                className={`ml-8 ${
                  index + cardsPerView >= blogs.length
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-[#5D4A4A] cursor-pointer"
                }`}
              >
                <FiArrowRight size={25} />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 overflow-hidden">
          <div className="flex gap-6 transition-transform duration-500 ease-in-out justify-start">
            {blogs.slice(index, index + cardsPerView).map((post, i) => (
              <div
                key={i}
                className="relative flex-none overflow-hidden bg-white p-2 rounded-2xl border border-[#D4A6CF] hover:shadow-md cursor-pointer hover:bg-[#FAF6F4] transition-all duration-200 w-full"
                style={{
                  maxWidth: `calc(${100 / cardsPerView}% - ${((cardsPerView - 1) * 24) / cardsPerView}px)`,
                }}
                onClick={() => handleSingleBlogPage(post.id)}
              >
                <div className="p-1">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={500}
                    height={300}
                    className="w-full h-[180px] sm:h-[200px] object-cover object-top rounded-xl"
                    unoptimized
                  />
                </div>
                <div className="p-2 mt-2">
                  <p className="text-xs text-gray-500 mb-2">
                    {formatDate(post.created_at)}&nbsp;&nbsp; {post.category}
                  </p>
                  <h3 className="font-semibold text-[#1C2C56] text-base mt-8">
                    {trimText(post.title, 10)}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {trimText(post.description, 18)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {blogs.length === 0 && (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No blog posts found</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UniformLatestBlogPosts;


