"use client";

import { useState } from "react";
import {
  FiSearch,
  FiPlus,
  FiX,
  FiEye,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import Select from "react-select";
import { useRouter } from "next/navigation";

const ThemePage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("grid");

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "Corporate", label: "Corporate" },
    { value: "Medical", label: "Medical" },
    { value: "Hotel", label: "Hotel" },
    { value: "Industrial", label: "Industrial" },
  ];

  const [category, setCategory] = useState(categoryOptions[0]);

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "42px",
      borderColor: "#D1D5DB",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#1C4FA8",
      },
    }),

    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#1C4FA8"
        : state.isFocused
          ? "#EEF4FF"
          : "#fff",
      color: state.isSelected ? "#fff" : "#1F2937",
    }),
  };

  const themes = [
    {
      id: 1,
      image: "https://picsum.photos/70/45?1",
      name: "Coastal Brunch Club",
      category: "Restaurant",
      description:
        "Relaxed coastal vibes with rattan, sea glass, and linen simplicity.",
      items: 8,
      usage: "47×",
    },
    {
      id: 2,
      image: "https://picsum.photos/70/45?2",
      name: "Garden of Versailles",
      category: "Wedding",
      description:
        "A grand floral affair with cascading blooms and gilded accents.",
      items: 8,
      usage: "47×",
    },
    {
      id: 3,
      image: "https://picsum.photos/70/45?3",
      name: "Corporate Blue",
      category: "Office",
      description:
        "Layered textiles, pampas grass, and burnished gold in effortless harmony.",
      items: 8,
      usage: "47×",
    },
    {
      id: 4,
      image: "https://picsum.photos/70/45?4",
      name: "Citrus Glow",
      category: "Event",
      description:
        "Sleek navy and charcoal corporate elegance for high-stakes events.",
      items: 8,
      usage: "47×",
    },
    {
      id: 5,
      image: "https://picsum.photos/70/45?5",
      name: "Elegant Wedding",
      category: "Wedding",
      description:
        "Earthy warmth with Mediterranean-inspired rustic abundance.",
      items: 8,
      usage: "47×",
    },
  ];

  return (
    <div className="bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-[28px] font-semibold text-[#1A1410]">
            Theme Management
          </h2>

          <p className="text-sm text-[#757575] mt-1">
            Manage decoration themes for your rental catalog
          </p>
        </div>

        <button
          onClick={() => router.push("/theme-management/addTheme")}
          className="bg-[#A0522D] transition text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium"
        >
          <FiPlus />
          Add New Theme
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A85A32B2]"
            size={16}
          />

          <input
            type="text"
            placeholder="Search Theme..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 border border-[#D1D5DB] text-[#A85A32B2] rounded-lg pl-10 pr-10 outline-none focus:border-[#1C4FA8]"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <FiX className="text-gray-500" />
            </button>
          )}
        </div>

        {/* Category */}
        <div className="w-56">
          <Select
            value={category}
            onChange={setCategory}
            options={categoryOptions}
            styles={selectStyles}
          />
        </div>

        {/* View Toggle */}
        <div className="ml-auto flex border border-[#D1D5DB] rounded-lg overflow-hidden">
          <button
            onClick={() => setView("grid")}
            className={`px-5 py-2 text-sm ${
              view === "grid"
                ? "bg-[#A85A320A] text-[#A85A32B2] font-semibold"
                : "bg-white text-[#A85A32B2] font-semibold"
            }`}
          >
            Grid
          </button>

          <button
            onClick={() => setView("list")}
            className={`px-5 py-2 text-sm ${
              view === "list"
                ? "bg-[#A85A320A] text-[#A85A32B2] font-semibold"
                : "bg-white text-[#A85A32B2] font-semibold"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {view === "list" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F1F5F9] text-[#486284]">
              <tr className="bg-[#F7F2EE] text-[#6B7280] text-sm">
                <th className="text-left px-4 py-3 font-medium">Theme</th>
                <th className="text-left px-4 py-3 font-medium">Theme</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-center px-4 py-3 font-medium">
                  Items Included
                </th>
                <th className="text-center px-4 py-3 font-medium">Usage</th>
                <th className="text-center px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {themes.map((theme) => (
                <tr
                  key={theme.id}
                  className="odd:bg-white even:bg-[#FBF8F6] hover:bg-[#F6F0EB] transition"
                >
                  <td className="px-4 py-3">
                    <img
                      src={theme.image}
                      alt=""
                      className="w-[58px] h-[40px] rounded object-cover"
                    />
                  </td>

                  <td className="px-4 py-3 font-medium text-[#1A1410]">
                    {theme.name}
                  </td>

                  <td className="px-4 py-3 text-[#4B5563]">{theme.category}</td>

                  <td className="px-4 py-3 text-center">{theme.items}</td>

                  <td className="px-4 py-3 text-center">{theme.usage}</td>

                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-3 text-[#7C6657]">
                      <button>
                        <FiEye size={15} />
                      </button>

                      <button>
                        <FiEdit2 size={15} />
                      </button>

                      <button className="hover:text-red-500">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className="bg-white rounded-2xl border border-[#E8E2DC] overflow-hidden hover:shadow-md transition"
            >
              {/* Image */}
              <div className="h-32 overflow-hidden">
                <img
                  src={theme.image}
                  alt={theme.name}
                  className="w-full h-full object-cover hover:scale-105 transition duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-[16px] text-[#1A1410]">
                    {theme.name}
                  </h3>

                  <span className="text-xs px-3 py-1 rounded-full bg-[#FFF3EC] text-[#A85A32] font-semibold">
                    {theme.category}
                  </span>
                </div>

                <p className="text-sm text-[#8A8A8A] mt-3 leading-6 h-12">
                  {theme.description}
                </p>

                <div className="flex justify-between items-center mt-5">
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-[#A85A32] hover:bg-[#8B4725] text-white text-xs font-medium px-4 py-2 rounded-full">
                      <FiEye size={13} />
                      Preview
                    </button>

                    <button className="flex items-center gap-2 border border-[#DDD] hover:border-[#A85A32] text-[#444] text-xs font-medium px-4 py-2 rounded-full">
                      <FiEdit2 size={13} />
                      Edit
                    </button>
                  </div>

                  <button className="w-8 h-8 rounded-full border border-[#E5E5E5] flex items-center justify-center hover:bg-red-50">
                    <FiTrash2
                      size={14}
                      className="text-[#8A8A8A] hover:text-red-500"
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemePage;
