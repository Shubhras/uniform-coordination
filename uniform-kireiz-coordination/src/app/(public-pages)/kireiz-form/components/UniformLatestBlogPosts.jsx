// "use client";

// import Image from "next/image";
// import { useRouter } from "next/navigation";

// const blogPosts = [
//   {
//     img: "/img/kireiz-form/features/Rectangle177.png",
//     date: "08-11-2025",
//     category: "Category",
//     title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
//     desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//   },
//   {
//     img: "/img/kireiz-form/features/Rectangle177.png",
//     date: "08-11-2025",
//     category: "Category",
//     title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
//     desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//   },
//   {
//     img: "/img/kireiz-form/features/Rectangle177.png",
//     date: "08-11-2025",
//     category: "Category",
//     title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
//     desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//   },
//   {
//     img: "/img/kireiz-form/features/Rectangle177.png",
//     date: "08-11-2025",
//     category: "Category",
//     title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
//     desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//   },
// ];

// const UniformLatestBlogPosts = () => {
//   const router = useRouter();

//     const handleAllBlogsPage = () => {
//     router.push("/blog");
//   };

//   const handleSingleBlogPage = () => {
//     router.push("/single-blog");
//   };
//   return (
//     <section className="w-full bg-white mx-auto px-5 md:px-8 lg:px-12">
//       <div className="py-14 md:py-16">
//         <div className="bg-[#F5F7FB] rounded-3xl px-6 md:px-10 py-10 md:py-16">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
//             <h2 className="text-center md:text-left text-3xl font-semibold text-[#1C2C56]">
//               Our Latest Blog Posts
//             </h2>
//             <button onClick={handleAllBlogsPage} className="self-center md:self-auto bg-[#162347] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition">
//               See All Blog Posts
//             </button>
//           </div>
//           <div
//             className="
//               grid gap-8
//               grid-cols-1
//               sm:grid-cols-2
//               lg:grid-cols-3
//               xl:grid-cols-4
//             "
//           >
//             {blogPosts.map((post, index) => (
//               <div
//                 key={index}
//                 className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer" onClick={handleSingleBlogPage}
//               >
//                 <div className="p-3">
//                   <Image
//                     src={post.img}
//                     alt={post.title}
//                     width={500}
//                     height={300}
//                     className="w-full h-[180px] sm:h-[200px] object-cover rounded-xl"
//                   />
//                 </div>
//                 <div className="px-5 pb-6">
//                   <p className="text-xs text-gray-500 mb-2">
//                     {post.date} &nbsp;&nbsp; {post.category}
//                   </p>
//                   <h3 className="font-semibold text-[#1C2C56] text-base mb-2 leading-snug">
//                     {post.title}
//                   </h3>
//                   <p className="text-sm text-gray-600 leading-relaxed">
//                     {post.desc}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default UniformLatestBlogPosts;
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const trimText = (text, limit = 15) =>
  text?.split(" ").slice(0, limit).join(" ") + "...";

const UniformLatestBlogPosts = ({ blogs = [], loading }) => {
  const router = useRouter();
  const handleSingleBlogPage = () => {
    router.push("/single-blog");
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
              className="bg-[#162347] text-white px-5 py-2 rounded-lg text-sm"
            >
              See All Blog Posts
            </button>
          </div>

          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {blogs.map((post,index) => (
              <div
                // key={post.id}
                key={index}
                className="bg-white rounded-2xl shadow-sm cursor-pointer"
                onClick={() => router.push("/single-blog")}
                // onClick={handleSingleBlogPage}
              >
                <div className="p-3">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={500}
                    height={300}
                    className="w-full h-[200px] object-cover rounded-xl"
                    unoptimized
                  />
                </div>
                <div className="px-5 pb-6">
                  <p className="text-xs text-gray-500 mb-2">
                    {post.category}
                  </p>
                  <h3 className="font-semibold text-[#1C2C56] capitalize">
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

