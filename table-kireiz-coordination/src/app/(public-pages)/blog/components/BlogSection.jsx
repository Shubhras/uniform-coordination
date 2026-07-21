"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGetBlogs } from "@/services/BlogService";

/* helpers (same usage as before) */
const trimText = (text, wordLimit = 10) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > wordLimit
        ? words.slice(0, wordLimit).join(" ") + "..."
        : text;
};

const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
};

const BlogSection = () => {
    const router = useRouter();

    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleClick = (id) => {
        console.log("click")
        router.push(`/single-blog/${id}`);
    };

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await apiGetBlogs();
                if (response?.status) {
                    const mapped = response.data.map((post) => ({
                        id: post.id,
                        slug: post.slug,
                        image: post.image_url || "/img/table-form/blog-image/blog1.png",
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
        <section className=" w-full bg-white mx-auto px-5 md:px-8 lg:px-12 mt-15">
            <div className=" rounded-3xl py-10 md:py-8">

                {/* HEADER */}
                <div className="text-center mb-10">
                    <h2 className=" lg:text-4xl text-3xl font-semibold">
                        Blog
                    </h2>
                    <div className="w-24 h-1 rounded-full bg-[#E8B4A9] mx-auto mt-2" />
                    <p className="text-[#6B7280] text-sm mt-4 max-w-xl mx-auto">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                    </p>
                </div>

                <h2 className="mb-5 lg:text-4xl text-3xl font-semibold ">
                    Our Latest Blog Posts
                </h2>

                {/* Loading state (no CSS change) */}
                {loading ? <section className="relative w-full bg-white mx-auto px-5 md:px-8 lg:px-12 mt-15">
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0522D]"></div>
                    </div>
                </section> : null}

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {blogs.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer border border-[#E8B4A9]"
                            onClick={() => handleClick(post.id)}
                        >
                            {/* Image */}
                            <div className="p-3">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    width={500}
                                    height={300}
                                    className="rounded-xl object-cover w-full h-[200px]"
                                    unoptimized
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

                {/* Empty state */}
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




// "use client";

// import Image from "next/image";
// import { useRouter } from 'next/navigation'
// const blogPosts = [
//     {
//         img: "/img/table-form/blog-image/blog1.png",
//         date: "08-11-2025",
//         category: "Category",
//         title: "Lorem ilit.",
//         desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolorit, sed do eiusmod tempor incididunt ut labore et dolor e magna aliqua.",
//     },
//     {
//         img: "/img/table-form/blog-image/blog2.png",
//         date: "08-11-2025",
//         category: "Category",
//         title: "Lorem ipsumlit.",
//         desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     },
//     {
//         img: "/img/table-form/blog-image/blog3.png",
//         date: "08-11-2025",
//         category: "Category",
//         title: "Lorem ipsum ng elit.",
//         desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     }, ,
//     {
//         img: "/img/table-form/blog-image/blog2.png",
//         date: "08-11-2025",
//         category: "Category",
//         title: "Lorem piscing elit.",
//         desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     },
//     {
//         img: "/img/table-form/blog-image/blog1.png",
//         date: "08-11-2025",
//         category: "Category",
//         title: "Lorem ipsum dlit.",
//         desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     }, ,
//     {
//         img: "/img/table-form/blog-image/blog3.png",
//         date: "08-11-2025",
//         category: "Category",
//         title: "Lorem ipsuit.",
//         desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     },
//     {
//         img: "/img/table-form/blog-image/blog1.png",
//         date: "08-11-2025",
//         category: "Category",
//         title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
//         desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     }, ,
//     {
//         img: "/img/table-form/blog-image/blog3.png",
//         date: "08-11-2025",
//         category: "Category",
//         title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
//         desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     },
//     {
//         img: "/img/table-form/blog-image/blog2.png",
//         date: "08-11-2025",
//         category: "Category",
//         title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
//         desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     }, ,
//     {
//         img: "/img/table-form/blog-image/blog3.png",
//         date: "08-11-2025",
//         category: "Category",
//         title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
//         desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     },
//     {
//         img: "/img/table-form/blog-image/blog1.png",
//         date: "08-11-2025",
//         category: "Category",
//         title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
//         desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     }, ,
//     {
//         img: "/img/table-form/blog-image/blog2.png",
//         date: "08-11-2025",
//         category: "Category",
//         title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
//         desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     },
// ];
// const trimText = (text, wordLimit = 10) => {
//     const words = text.split(" ");
//     return words.length > wordLimit
//         ? words.slice(0, wordLimit).join(" ") + "..."
//         : text;
// };

// const BlogSection = () => {
//     const router = useRouter()
//     const handleClick = () => {
//         router.push("/single-blog");
//     };

//     return (
//         <section className=" w-full bg-white mx-auto px-5 md:px-8 lg:px-12 mt-15">
//             <div className=" rounded-3xl py-10 md:py-8">

//                 {/* HEADER */}
//                 <div className="text-center mb-10">
//                     <h2 className=" lg:text-4xl text-3xl font-semibold">
//                         Blog
//                     </h2>
//                     <div className="w-24 h-1 rounded-full bg-[#E8B4A9] mx-auto mt-2" />
//                     <p className="text-[#6B7280] text-sm mt-4 max-w-xl mx-auto">
//                         Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
//                     </p>
//                 </div>


//                 <h2 className="mb-5 lg:text-4xl text-3xl font-semibold ">
//                     Our Latest Blog Posts
//                 </h2>
//                 {/* Cards */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
//                     {blogPosts.map((post, index) => (
//                         <div
//                             key={index}
//                             className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer border border-[#E8B4A9]"
//                             onClick={handleClick}
//                         >
//                             {/* Image */}
//                             <div className="p-3">
//                                 <Image
//                                     src={post.img}
//                                     alt={post.title}
//                                     width={500}
//                                     height={300}
//                                     className="rounded-xl object-cover w-full h-[200px]"
//                                 />
//                             </div>

//                             {/* Content */}
//                             <div className="px-5 pb-6 flex flex-col gap-3">
//                                 <p className="text-xs text-gray-500 mb-2">
//                                     {post.date} &nbsp;&nbsp; {post.category}
//                                 </p>

//                                 <h3 className="font-semibold text-[#1C2C56] text-base mb-2 leading-snug">
//                                     {trimText(post.title, 10)}
//                                 </h3>

//                                 <p className="text-sm text-gray-600 leading-relaxed">
//                                     {trimText(post.desc, 15)}
//                                 </p>

//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     );
// };

// export default BlogSection;
