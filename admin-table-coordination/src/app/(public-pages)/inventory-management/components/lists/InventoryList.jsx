"use client";

import { useState } from "react";
import Select from "react-select";
import { useRouter } from "next/navigation";
import { FiSearch, FiEye, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import NewDeleteModal from "@/components/shared/NewDeleteModal";

const inventoryData = [
  {
    id: 1,
    productName: "Grand Tablecloth",
    category: "Tablecloth",
    fabric: "Cotton Blend",
    total: 12,
    available: 7,
    onRent: 3,
    cleaning: 1,
    inspect: 0,
  },
  {
    id: 2,
    productName: "Grand Tablecloth",
    category: "Tablecloth",
    fabric: "Cotton Blend",
    total: 12,
    available: 7,
    onRent: 3,
    cleaning: 1,
    inspect: 0,
  },
  {
    id: 3,
    productName: "Grand Tablecloth",
    category: "Tablecloth",
    fabric: "Cotton Blend",
    total: 12,
    available: 7,
    onRent: 3,
    cleaning: 1,
    inspect: 0,
  },
  {
    id: 4,
    productName: "Grand Tablecloth",
    category: "Tablecloth",
    fabric: "Cotton Blend",
    total: 12,
    available: 7,
    onRent: 3,
    cleaning: 1,
    inspect: 0,
  },
  {
    id: 5,
    productName: "Grand Tablecloth",
    category: "Tablecloth",
    fabric: "Cotton Blend",
    total: 12,
    available: 7,
    onRent: 3,
    cleaning: 1,
    inspect: 0,
  },
];

const InventoryList = () => {
  const router = useRouter();
  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "tablecloth", label: "Tablecloth" },
    { value: "napkin", label: "Napkin" },
    { value: "chair-cover", label: "Chair Cover" },
  ];

  const materialOptions = [
    { value: "all", label: "All Material" },
    { value: "cotton", label: "Cotton" },
    { value: "cotton-blend", label: "Cotton Blend" },
    { value: "linen", label: "Linen" },
  ];

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(categoryOptions[0]);
  const [material, setMaterial] = useState(materialOptions[0]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fabricToDelete, setFabricToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDeleteClick = (item) => {
    setFabricToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);

    // API yaha call hogi
    await new Promise((resolve) => setTimeout(resolve, 800));

    setDeleteLoading(false);
    setDeleteDialogOpen(false);
    setFabricToDelete(null);

    console.log("Deleted:", fabricToDelete);
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "44px",
      borderColor: "#EFE5DD",
      boxShadow: "none",
      borderRadius: "8px",
      "&:hover": {
        borderColor: "#C08457",
      },
    }),

    singleValue: (base) => ({
      ...base,
      color: "#A85A32B2",
    }),

    placeholder: (base) => ({
      ...base,
      color: "#A85A32B2",
    }),

    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#A0522D"
        : state.isFocused
          ? "#F8F2ED"
          : "#fff",
      color: state.isSelected ? "#fff" : "#444",
    }),
  };

  return (
    <>
      <div className="space-y-5">
        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ">
          <div className="relative w-full lg:max-w-xl">
            <FiSearch className="absolute left-4  top-1/2 -translate-y-1/2 text-[#C08457] text-sm" />

            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 rounded-lg border border-[#EFE5DD] text-[#C08457] pl-10 pr-4  text-sm outline-none focus:border-[#C08457]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <FiX className="text-gray-500" />
              </button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            {/* <div className="relative w-full lg:max-w-xl">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A85A32B2]"
              size={16}
            />

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 rounded-lg border border-[#EFE5DD] pl-10 pr-4 text-sm outline-none focus:border-[#A0522D]"
            />
          </div> */}

            {/* Filters */}
            <div className="flex gap-3">
              <div className="w-52">
                <Select
                  value={category}
                  onChange={setCategory}
                  options={categoryOptions}
                  styles={selectStyles}
                  isSearchable={false}
                />
              </div>

              <div className="w-52">
                <Select
                  value={material}
                  onChange={setMaterial}
                  options={materialOptions}
                  styles={selectStyles}
                  isSearchable={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-l border border-[#EFE5DD]">
          <table className="min-w-full">
            <thead className="bg-[#A85A320F]">
              <tr className="text-left font-normal text-[16px] text-[#5D5E5F]">
                <th className="px-5 py-3 font-normal">Product Name</th>
                <th className="px-5 py-3 font-normal">Category</th>
                <th className="px-5 py-3 font-normal">Fabric</th>
                <th className="px-5 py-3 font-normal">Total</th>
                <th className="px-5 py-3 font-normal">Available</th>
                <th className="px-5 py-3 font-normal">On Rent</th>
                <th className="px-5 py-3 font-normal ">Cleaning</th>
                <th className="px-5 py-3 font-normal">Inspect</th>
                <th className="px-5 py-3 font-normal text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {inventoryData.map((item, index) => (
                <tr
                  key={item.id}
                  className={`text-[13px] ${
                    index % 2 === 0 ? "bg-white" : "bg-[#FBF7F3]"
                  }`}
                >
                  <td className="px-5 py-5 text-[#2C1A0E]">
                    {item.productName}
                  </td>

                  <td className="px-5 py-5 text-[#2C1A0E] text-[14px]">
                    {item.category}
                  </td>

                  <td className="px-5 py-5 text-[#2C1A0E] text-[14px]">
                    {item.fabric}
                  </td>

                  <td className="px-5 py-5 text-[#2C1A0E] text-[14px]">
                    {item.total}
                  </td>

                  <td className="px-5 py-5 text-[#2C1A0E] text-[14px]">
                    {item.available}
                  </td>

                  <td className="px-5 py-5 text-[#2C1A0E] text-[14px]">
                    {item.onRent}
                  </td>

                  <td className="px-5 py-5 text-[#2C1A0E] text-[14px]">
                    {item.cleaning}
                  </td>

                  <td className="px-5 py-5 text-[#2C1A0E] text-[14px]">
                    {item.inspect}
                  </td>

                  <td className="px-5 py-5">
                    <div className="flex justify-center items-center gap-3 text-[#555]">
                      <button
                        onClick={() =>
                          router.push(
                            "/inventory-management/inventory-list/view",
                          )
                        }
                        className="text-[#2C1A0E]"
                      >
                        <FiEye size={15} />
                      </button>

                      <button
                        className="text-[#2C1A0E]"
                        onClick={() =>
                          router.push(
                            `/inventory-management/add?mode=edit&id=${item.id}`,
                          )
                        }
                      >
                        <FiEdit2 size={15} />
                      </button>

                      <button
                        className="text-[#2C1A0E]"
                        onClick={() => handleDeleteClick(item)}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <NewDeleteModal
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setFabricToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message="Deleting this product will remove it from all over the platform. This action cannot be undone."
        itemName={fabricToDelete?.productName}
        loading={deleteLoading}
      />
    </>
  );
};

export default InventoryList;
