"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const blogPosts = [
  {
    img: "/img/table-form/blog-image/blog1.png",
    date: "08-11-2025",
    category: "Category",
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    img: "/img/table-form/blog-image/blog2.png",
    date: "08-11-2025",
    category: "Category",
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    img: "/img/table-form/blog-image/blog3.png",
    date: "08-11-2025",
    category: "Category",
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    img: "/img/table-form/blog-image/blog1.png",
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
    <section className="w-full bg-white mx-auto px-5 md:px-8 lg:px-12">
        <div className="py-10 md:py-16 ">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <h2 className="text-center md:text-left text-3xl font-semibold text-[#402936]">
              Our Latest Blog Posts
            </h2>
            <button onClick={handleAllBlogsPage} className="border border-[#A0522D] self-center md:self-auto text-[#5D4A4A] px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition">
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
                className="bg-white  p-2 rounded-2xl  border border-[#D4A6CF] hover:shadow-md overflow-hidden cursor-pointer hover:bg-[#FAF6F4] transition-all duration-200" onClick={handleSingleBlogPage}
              >
                <div className="">
                  <Image
                    src={post.img}
                    alt={post.title}
                    width={500}
                    height={300}
                    className="w-full h-[180px] sm:h-[200px] object-cover rounded-xl"
                  />
                </div>
                <div className=" text-[#4A5E6F]">
                  <p className="text-base my-3">
                    {post.date} &nbsp;&nbsp; {post.category}
                  </p>
                  <h3 className="font-medium  text-xl mb-2 leading-snug text-[#00213E]">
                    {post.title}
                  </h3>
                  <p className="text-sm  leading-relaxed text-[#8E8E93]">
                    {post.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
    </section>
  );
};

export default UniformLatestBlogPosts;

