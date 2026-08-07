"use client";

import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const ViewBlogModal = ({ isOpen, onClose, post }) => {
  if (!post) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={onClose}
      className="w-full md:min-w-[650px] max-w-[750px] mx-auto"
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-150 px-6 py-4 flex justify-between items-center bg-[#FFFDFC]">
          <h2 className="text-xl font-bold text-[#1C2C56] leading-snug">
            Blog Post Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Main Cover Image */}
          {post.image_url && (
            <div className="relative w-full h-[280px] rounded-xl overflow-hidden shadow-sm">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Metadata Badges */}
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <span className="bg-[#A0522D1A] text-[#A0522D] px-2.5 py-1 rounded-full font-medium">
              {post.categoryName || "Uncategorized"}
            </span>
            <span className="bg-[#1C2C561A] text-[#1C2C56] px-2.5 py-1 rounded-full font-medium capitalize">
              Type: {post.type || "N/A"}
            </span>
            <span className="text-gray-500 ml-auto">
              Published: {formatDate(post.created_at)}
            </span>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-extrabold text-[#1C2C56] tracking-tight">
              {post.title}
            </h1>
          </div>

          {/* Description */}
          <div className="text-[#486284] text-base leading-relaxed whitespace-pre-wrap border-t border-gray-100 pt-4">
            {post.description}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-150 px-6 py-4 flex justify-end bg-gray-50">
          <Button
            variant="solid"
            size="sm"
            className="bg-[#A0522D] hover:bg-[#8A4225] text-white px-6 py-2 rounded-md font-medium"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default ViewBlogModal;
