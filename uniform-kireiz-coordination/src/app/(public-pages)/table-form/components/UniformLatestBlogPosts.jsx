"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

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
  {
    img: "/img/kireiz-form/features/Rectangle177.png",
    date: "08-11-2025",
    category: "Category",
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
];

const UniformLatestBlogPosts = () => {
  const router = useRouter();

  const handleAllBlogsPage = () => {
    router.push("/blog");
  };

  const handleSingleBlogPage = () => {
    router.push("/single-blog");
  };
  return (
    <section className="w-full bg-[#fffdfb] px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="">
        <div className="bg-[#F8D7DA33] px-6 md:px-10 py-10 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <h2 className="text-center md:text-left text-3xl font-semibold text-[#402936]">
              Our Latest Blog Posts
            </h2>
            <button onClick={handleAllBlogsPage} className="border border-[#D4A6A6] self-center md:self-auto text-[#5D4A4A] px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition">
              See All Blog Posts
            </button>
          </div>
          <div
            className="
              grid gap-8
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >
            {blogPosts.map((post, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer border border-[#D4A6A6]" onClick={handleSingleBlogPage}
              >
                <div className="p-2">
                  <Image
                    src={post.img}
                    alt={post.title}
                    width={500}
                    height={300}
                    className="w-full h-[180px] sm:h-[200px] object-cover rounded-xl"
                  />
                </div>
                <div className="px-5 pb-6 text-[#402936]">
                  <p className="text-xs mb-2">
                    {post.date} &nbsp;&nbsp; {post.category}
                  </p>
                  <h3 className="font-semibold  text-base mb-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm  leading-relaxed">
                    {post.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UniformLatestBlogPosts;

