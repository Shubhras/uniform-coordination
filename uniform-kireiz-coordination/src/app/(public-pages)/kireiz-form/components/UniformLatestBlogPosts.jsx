"use client";

import Image from "next/image";
import Container from "./LandingContainer";

const blogPosts = [
  {
    img: "/img/kireiz-form/features/Rectangle177.png",
    date: "08-11-2025",
    category: "Category",
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    img: "/img/kireiz-form/features/Rectangle177.png",
    date: "08-11-2025",
    category: "Category",
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    img: "/img/kireiz-form/features/Rectangle177.png",
    date: "08-11-2025",
    category: "Category",
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
];

const UniformLatestBlogPosts = () => {
  return (
    <section className="relative py-14 md:py-24">
      <Container>
        <div className="bg-[#F5F7FB] rounded-3xl px-6 md:px-10 lg:px-8 py-10 md:py-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <h2 className="text-center text-3xl md:text-3xl font-semibold text-[#1C2C56]">
              Our Latest Blog Posts
            </h2>

            <button className="self-start md:self-auto bg-[#162347] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#162347] transition">
              See All Blog Posts
            </button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {/* Image */}
                <div className="p-3">
                  <Image
                    src={post.img}
                    alt={post.title}
                    width={500}
                    height={300}
                    className="rounded-xl object-cover w-full h-[200px]"
                  />
                </div>

                {/* Content */}
                <div className="px-5 pb-6">
                  <p className="text-xs text-gray-500 mb-2">
                    {post.date} &nbsp;&nbsp; {post.category}
                  </p>

                  <h3 className="font-semibold text-[#1C2C56] text-base mb-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-sm text-gray-600 leading-relaxed">
                    {post.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default UniformLatestBlogPosts;
