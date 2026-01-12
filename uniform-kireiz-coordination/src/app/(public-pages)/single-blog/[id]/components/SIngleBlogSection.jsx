// "use client";

// import Container from "@/components/shared/Container";
// import Image from "next/image";

// const blogData = {
//     img: "/img/kireiz-form/features/Rectangle177.png",
//     title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
//     date: "08-11-2025",
//     description: `
//     Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
//     incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
//     exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

//     Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
//     fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
//     culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
//     incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
//     exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

//     Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
//     fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
//     culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
//     incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
//     exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

//     Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
//     fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
//     culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
//     incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
//     exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

//     Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
//     fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
//     culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
//     incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
//     exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

//     Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
//     fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
//     culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
//     incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
//     exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

//     Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
//     fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
//     culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
//     incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
//     exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

//     Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
//     fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
//     culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
//     incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
//     exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

//     Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
//     fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
//     culpa qui officia deserunt mollit anim id est laborum.
//   `,
// };


// const SingleBlogSection = () => {
//     return (
//         <section className="relative w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12 py-20 md:py-24">
//             <div className="bg-[#F5F7FB] rounded-3xl px-1 md:px-10 lg:px-8 py-10 md:py-8">

//                 {/* HEADER */}
//                 <div className="text-center lg:mb-24 md:mb-18 mb-10">
//                     <h2 className="text-[#1C2C56] lg:text-4xl text-3xl font-semibold">
//                         Blog
//                     </h2>
//                     <div className="w-24 h-1 rounded-full bg-[#1C2C56] mx-auto mt-2" />
//                     <p className="text-[#6B7280] text-sm mt-4 max-w-xl mx-auto">
//                         Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
//                     </p>
//                 </div>


//                 <h2 className=" text-center mb-5 lg:text-4xl text-3xl font-semibold text-[#1C2C56]">
//                     Our Latest Blog Posts
//                 </h2>
//                 {/* Cards */}
//                 <div className="w-full bg-[#F5F7FB] rounded-3xl p-3">

//                     {/* Image */}
//                     <div className="mb-6">
//                         <Image
//                             src={blogData.img}
//                             alt={blogData.title}
//                             width={900}
//                             height={450}
//                             className="w-full lg:h-[600px] lg:object-cover object-contain rounded-2xl"
//                         />
//                     </div>

//                     {/* Title + Date */}
//                     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
//                         <h1 className="text-2xl md:text-3xl font-semibold text-[#1C2C56]">
//                             {blogData.title}
//                         </h1>
//                         <p className="text-sm text-gray-500">
//                             {blogData.date}
//                         </p>
//                     </div>

//                     {/* Description */}
//                     <div className="text-gray-700 text-sm md:text-base leading-relaxed space-y-4">
//                         {blogData.description}
//                     </div>

//                 </div>
//             </div>
//         </section>
//     );
// };

// export default SingleBlogSection;


"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGetBlogDetail } from "@/services/BlogService";

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

const SingleBlogSection = () => {
  const { id } = useParams();
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await apiGetBlogDetail(id);
        if (res?.status) {
          setBlogData({
            img: res.data.image || "/img/placeholder.png",
            title: res.data.title,
            date: formatDate(res.data.created_at),
            description: res.data.description,
          });
        }
      } catch (err) {
        console.error("Failed to load blog detail", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBlog();
  }, [id]);

  if (!blogData) {
    return (
      <section className="relative w-full bg-white mx-auto px-5 md:px-8 lg:px-12 mt-15">
        <div className="py-20 text-center text-gray-500">
          Blog not found
        </div>
      </section>
    );
  }
  return (
    <section className="relative w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12 py-20 md:py-24">
      <div className="bg-[#F5F7FB] rounded-3xl px-1 md:px-10 lg:px-8 py-10 md:py-8">

        {/* HEADER */}
        <div className="text-center lg:mb-24 md:mb-18 mb-10">
          <h2 className="text-[#1C2C56] lg:text-4xl text-3xl font-semibold">
            Blog
          </h2>
          <div className="w-24 h-1 rounded-full bg-[#1C2C56] mx-auto mt-2" />
          <p className="text-[#6B7280] text-sm mt-4 max-w-xl mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          </p>
        </div>

        <h2 className="text-center mb-5 lg:text-4xl text-3xl font-semibold text-[#1C2C56]">
          Our Latest Blog Posts
        </h2>

        {/* Blog Content */}
        {
          loading ? <section className="relative w-full bg-white mx-auto px-5 md:px-8 lg:px-12 mt-15">
            <div className="py-20 text-center text-gray-500">
              Loading blog...
            </div>
          </section> :
            <div className="w-full bg-[#F5F7FB] rounded-3xl p-3">

              {/* Image */}
              <div className="mb-6">
                <Image
                  src={blogData.img}
                  alt={blogData.title}
                  width={900}
                  height={450}
                  className="w-full lg:h-[600px] lg:object-cover object-contain rounded-2xl"
                  unoptimized
                />
              </div>

              {/* Title + Date */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-semibold text-[#1C2C56]">
                  {blogData.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {blogData.date}
                </p>
              </div>

              {/* Description */}
              <div
                className="text-gray-700 text-sm md:text-base leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: blogData.description }}
              />
            </div>
        }
      </div>
    </section>
  );
};

export default SingleBlogSection;
