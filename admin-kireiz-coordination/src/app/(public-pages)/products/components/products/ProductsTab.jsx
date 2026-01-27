"use client";

import React, { useState } from "react";
import AddEditProductModal from "./AddEditProductModal";

const initialProducts = [
  {
    id: 1,
    name: "Item Name",
    description: "Description",
    image: "/img/kireiz-form/features/uniform-card-img-one.png",
    category: "health",
    part: "collar",
    type: "top",
    subCategory: "doctor",
  },
  {
    id: 2,
    name: "Item Name",
    description: "Description",
    image: "/img/kireiz-form/features/uniform-card-img-two.png",
    category: "health",
    part: "collar",
    type: "top",
    subCategory: "doctor",
  },
  {
    id: 3,
    name: "Item Name",
    description: "Description",
    image: "/img/kireiz-form/features/uniform-card-img-one.png",
    category: "health",
    part: "collar",
    type: "top",
    subCategory: "doctor",
  },
  {
    id: 4,
    name: "Item Name",
    description: "Description",
    image: "/img/kireiz-form/features/uniform-card-img-two.png",
    category: "health",
    part: "collar",
    type: "top",
    subCategory: "doctor",
  },
  {
    id: 5,
    name: "Item Name",
    description: "Description",
    image: "/img/kireiz-form/features/uniform-card-img-one.png",
    category: "health",
    part: "collar",
    type: "top",
    subCategory: "doctor",
  },
  {
    id: 6,
    name: "Item Name",
    description: "Description",
    image: "/img/kireiz-form/features/uniform-card-img-two.png",
    category: "health",
    part: "collar",
    type: "top",
    subCategory: "doctor",
  },
];

const ProductsTab = () => {
  const [products, setProducts] = useState(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSave = (data) => {
    if (data.id) {
      setProducts((prev) =>
        prev.map((p) => (p.id === data.id ? data : p))
      );
    } else {
      setProducts((prev) => [...prev, { ...data, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow md:p-6 p-3">

      {/* HEADER — MATCHES TEMPLATE GALLERY */}
      <div className="flex justify-between items-start flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#1C2C56]">
            Product Creation
          </h2>
          <p className="text-sm text-[#486284]">
            {products.length} products available
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="bg-[#1C2C56] text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          + Add Product
        </button>
      </div>

      {/* GRID — SAME CARD FEEL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {products.map((item) => (
          <div
            key={item.id}
            className="border border-[#E2E8F0] rounded-xl bg-white hover:shadow-md transition"
          >
            {/* IMAGE */}
            <div className="flex justify-center items-center p-3">
              <div className="w-32 h-32 flex items-center justify-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            {/* CONTENT */}
            <div className="px-4 pb-4 text-center">
              <h3 className="text-sm font-semibold text-[#1C2C56]">
                {item.name}
              </h3>

              <p className="text-xs text-[#486284] mt-1">
                {item.description}
              </p>

              <button
                onClick={() => handleEdit(item)}
                className="mt-4 w-full bg-[#1C2C56] text-white text-xs py-2 rounded-md"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <AddEditProductModal
        isOpen={isModalOpen}
        initialData={selectedProduct}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default ProductsTab;
