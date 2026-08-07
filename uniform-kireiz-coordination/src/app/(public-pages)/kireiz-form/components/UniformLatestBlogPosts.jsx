"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const trimText = (text, limit = 15) =>
  text?.split(" ").slice(0, limit).join(" ") + "...";

const UniformLatestBlogPosts = ({ blogs = [], loading }) => {
  const router = useRouter();
  const handleClick = (id) => {
    router.push(`/single-blog/${id}`);
  };
  if (loading) return <p className="text-center">Loading blogs...</p>;

  return (
    <section className="w-full bg-white px-5 md:px-8 lg:px-12">
      <div className="py-14">
        <div className="bg-[#F5F7FB] rounded-3xl px-6 py-10">
          <div className="flex justify-between mb-10">
            <h2 className="text-3xl font-semibold text-[#1C2C56]">
              Our Latest Blog Posts
            </h2>
            <button
              onClick={() => router.push("/blog")}
              className="bg-[#1C4FA8] text-white px-5 py-2 rounded-lg text-sm"
            >
              See All Blog Posts
            </button>
          </div>

          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {blogs.slice(0, 3).map((post, index) => (
              <div
                // key={post.id}
                key={index}
                className="bg-white rounded-2xl shadow-sm cursor-pointer"
                onClick={() => handleClick(post.id)}
              // onClick={handleSingleBlogPage}
              >
                <div className="p-3">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={500}
                    height={300}
                    className="w-full h-[200px] object-cover object-top rounded-xl"
                    unoptimized
                  />
                </div>
                <div className="px-5 pb-6">
                  <p className="text-xs text-gray-500 mb-2">
                    {post.category}
                  </p>
                  <h3 className="font-semibold text-[#1C2C56] text-base leading-snug">
                    {trimText(post.title, 10)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {trimText(post.description, 18)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {!blogs.length && (
            <p className="text-center text-gray-500 mt-10">
              No blogs available
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default UniformLatestBlogPosts;

