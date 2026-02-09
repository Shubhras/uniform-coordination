 "use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FiEdit2, FiPlus, FiSearch } from "react-icons/fi";
import AddEditBlogModal from "./AddEditBlogModal";

const initialPosts = [
  {
    id: "blog-1",
    img: "/img/kireiz-form/features/Rectangle177.png",
    date: "08-11-2025",
    category: "Category",
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: "blog-2",
    img: "/img/kireiz-form/features/Rectangle177.png",
    date: "08-11-2025",
    category: "Category",
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: "blog-3",
    img: "/img/kireiz-form/features/Rectangle177.png",
    date: "08-11-2025",
    category: "Category",
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
];

const trimText = (text, wordLimit = 10) => {
  const words = text.split(" ");
  return words.length > wordLimit
    ? `${words.slice(0, wordLimit).join(" ")}...`
    : text;
};

const BlogTab = () => {
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [posts] = useState(initialPosts);

  const filteredPosts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter((post) =>
      post.title.toLowerCase().includes(term)
    );
  }, [posts, search]);

  return (
    <>
      <div className="bg-[#F4F7FC] rounded-xl shadow md:p-6 p-3">
        <div className="flex justify-between sm:flex-row flex-col items-start gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-semibold text-[#1C2C56]">Blog</h2>
            <p className="text-base text-[#486284]">
              Manage your blog posts
            </p>
          </div>

          <div className="flex gap-3">
            <button className="border border-[#CBD5E1] text-[#1C2C56] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
              Arrange Order
            </button>

            <button
              className="bg-[#1C2C56] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
              onClick={() => {
                setEditPost(null);
                setOpenModal(true);
              }}
            >
              <FiPlus size={16} />
              Add Blog
            </button>
          </div>
        </div>

        <div className="relative w-full md:w-80 mb-6">
          <FiSearch className="absolute left-3 top-2.5 text-[#64748B]" size={16} />
          <input
            type="text"
            placeholder="Search Blog Posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#00345F] rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none"
          />
        </div>

        <h2 className="mb-5 lg:text-3xl text-2xl font-semibold text-[#1C2C56]">
          Our Latest Blog Posts
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <div className="p-3">
                <Image
                  src={post.img}
                  alt={post.title}
                  width={500}
                  height={300}
                  className="rounded-xl object-cover w-full h-[200px]"
                />
              </div>

              <div className="px-5 pb-6 flex flex-col gap-3">
                <p className="text-xs text-gray-500 mb-2">
                  {post.date} &nbsp;&nbsp; {post.category}
                </p>

                <h3 className="font-semibold text-[#1C2C56] text-base mb-2 leading-snug">
                  {trimText(post.title, 10)}
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {trimText(post.desc, 15)}
                </p>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-[#1C2C56] hover:text-[#0F172A]"
                    onClick={() => {
                      setEditPost(post);
                      setOpenModal(true);
                    }}
                  >
                    <FiEdit2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddEditBlogModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        mode={editPost ? "edit" : "add"}
        initialData={editPost}
      />
    </>
  );
};

export default BlogTab;
