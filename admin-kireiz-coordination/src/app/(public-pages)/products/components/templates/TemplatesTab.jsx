"use client";

import { useState } from "react";
import { FiSearch, FiPlus } from "react-icons/fi";
import Select from "react-select";
import AddEditTemplateModal from "./AddEditTemplateModal";

const TemplatesTab = () => {
  const [openModal, setOpenModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);

  const templates = [
    {
      name: "Classic Chef Coat",
      category: "Chef Wear",
      parts: 8,
      status: "Active",
      image: "/img/kireiz-form/features/uniform-card-img-one.png",
    },
    {
      name: "Modern Apron",
      category: "Aprons",
      parts: 4,
      status: "Active",
      image: "/img/kireiz-form/features/uniform-card-img-one.png",
    },
    {
      name: "Executive Chef Coat",
      category: "Chef Wear",
      parts: 10,
      status: "Active",
      image: "/img/kireiz-form/features/uniform-card-img-one.png",
    },
    {
      name: "Short Sleeve Chef Coat",
      category: "Chef Wear",
      parts: 10,
      status: "Active",
      image: "/img/kireiz-form/features/uniform-card-img-one.png",
    },
    {
      name: "Classic Chef Coat",
      category: "Chef Wear",
      parts: 8,
      status: "Active",
      image: "/img/kireiz-form/features/uniform-card-img-one.png",
    },
    {
      name: "Modern Apron",
      category: "Aprons",
      parts: 4,
      status: "Active",
      image: "/img/kireiz-form/features/uniform-card-img-one.png",
    },
    {
      name: "Executive Chef Coat",
      category: "Chef Wear",
      parts: 10,
      status: "Active",
      image: "/img/kireiz-form/features/uniform-card-img-one.png",
    },
    {
      name: "Short Sleeve Chef Coat",
      category: "Chef Wear",
      parts: 10,
      status: "Active",
      image: "/img/kireiz-form/features/uniform-card-img-one.png",
    },
  ];

  const filterOptions = [
    { value: "all", label: "All Categories" },
    { value: "chef-wear", label: "Chef Wear" },
    { value: "aprons", label: "Aprons" },
  ]

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "40px",
      borderRadius: "6px",
      borderColor: "#E2E8F0",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#1C2C56",
      },

    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#1C2C56"
        : state.isFocused
          ? "#EEF2FF"
          : "white",
      color: state.isSelected ? "white" : "#1E293B",
      fontSize: "14px",
    }),

    /* ✅ THIS IS THE IMPORTANT PART */
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };


  const handleAdd = () => {
    setEditTemplate(null);
    setOpenModal(true);
  };

  const handleEdit = (template) => {
    setEditTemplate(template);
    setOpenModal(true);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow md:p-6 p-3">
        <div className="flex justify-between items-start flex-wrap gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#1C2C56]">
              Template Gallery
            </h2>
            <p className="text-sm text-[#486284]">
              {templates.length} templates available
            </p>
          </div>

          <div className="flex gap-2">
            <button className="border border-[#CBD5E1] px-4 py-2 rounded-md text-sm text-[#1C2C56]">
              Import Template
            </button>
            <button
              onClick={handleAdd}
              className="bg-[#1C2C56] text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
            >
              <FiPlus size={14} />
              Create Template
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div className="relative w-full md:w-72">
            <FiSearch className="absolute left-3 top-2.5 text-[#64748B]" size={16} />
            <input
              type="text"
              placeholder="Search Templates..."
              className="w-full border border-[#00345F] rounded-md pl-9 pr-3 py-2 text-sm"
            />
          </div>

          <Select
            options={filterOptions}
            defaultValue={filterOptions[0]}
            styles={selectStyles}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            className="w-48 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {templates.map((t, index) => (
            <div
              key={index}
              className="border border-[#E2E8F0] rounded-xl bg-white hover:shadow-md transition"
            >
              <div className="flex justify-center items-center p-3">
                <div className="w-32 h-32 flex items-center justify-center">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>

              <div className="px-4 pb-4">
                <h3 className="text-sm font-semibold text-[#1C2C56]">
                  {t.name}
                </h3>

                <p className="text-xs text-[#486284] mt-1">
                  {t.category} &nbsp; | &nbsp; {t.parts} Parts
                </p>

                <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs bg-[#EEF2FF] text-[#1C2C56]">
                  {t.status}
                </span>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(t)}
                    className="flex-1 bg-[#1C2C56] text-white text-xs py-1.5 rounded-md"
                  >
                    Edit
                  </button>
                  <button className="flex-1 border border-[#CBD5E1] text-[#1C2C56] text-xs py-1.5 rounded-md">
                    Duplicate
                  </button>
                  <button className="flex-1 border border-[#CBD5E1] text-[#1C2C56] text-xs py-1.5 rounded-md">
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddEditTemplateModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        mode={editTemplate ? "edit" : "add"}
        initialData={editTemplate}
      />
    </>
  );
};

export default TemplatesTab;
