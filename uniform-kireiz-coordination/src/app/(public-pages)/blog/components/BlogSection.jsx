"use client";

import Image from "next/image";
import { useRouter } from 'next/navigation'
const blogPosts = [
    {
        img: "/img/kireiz-form/features/Rectangle177.png",
        date: "08-11-2025",
        category: "Category",
        title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolor e magna aliqua.",
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
    }, ,
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
    }, ,
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
    }, ,
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
    }, ,
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
    }, ,
    {
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
        ? words.slice(0, wordLimit).join(" ") + "..."
        : text;
};

const BlogSection = () => {
    const router = useRouter()
    const handleClick = () => {
        router.push("/single-blog");
    };



    return (
        <section className=" w-full bg-white px-5 md:px-8 lg:px-12 pt-20 md:pt-24">
            <div className="bg-[#F5F7FB] rounded-3xl px-4 md:px-10 lg:px-8 py-8">

                {/* HEADER */}
                <div className="text-center mb-10">
                    <h2 className="text-[#1C2C56] lg:text-4xl text-3xl font-semibold">
                        Blog
                    </h2>
                    <div className="w-24 h-1 rounded-full bg-[#1C2C56] mx-auto mt-2" />
                    <p className="text-[#6B7280] text-sm mt-4 max-w-xl mx-auto">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                    </p>
                </div>


                <h2 className="mb-5 lg:text-4xl text-3xl font-semibold text-[#1C2C56]">
                    Our Latest Blog Posts
                </h2>
                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {blogPosts.map((post, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
                            onClick={handleClick}
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

                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BlogSection;
