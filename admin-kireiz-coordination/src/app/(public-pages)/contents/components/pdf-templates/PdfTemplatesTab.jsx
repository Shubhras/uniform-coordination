"use client";

import React, { useState } from "react";
import { FiGrid, FiEdit2, FiPlus } from "react-icons/fi";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

const PdfTemplatesTab = () => {
  const [templates, setTemplates] = useState([
    {
      name: "Standard quotation",
      description: "A4 • 6 customizable fields",
    },
    {
      name: "Detailed Catalog",
      description: "Letter • 12 customizable fields",
    },
    {
      name: "Quick Quote",
      description: "A4 • 5 customizable fields",
    },
  ]);

  // Handle drag reorder
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(templates);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    setTemplates(items);
  };

  return (
    <div className="bg-[#F4F7FC] rounded-xl shadow md:p-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#1C2C56]">
            PDF Template Library
          </h2>
          <p className="text-base text-[#486284]">
            Manage your catalog templates
          </p>
        </div>

        <button className="bg-[#1C2C56] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
          <FiPlus size={16} />
          Add Template
        </button>
      </div>

      {/* Drag & Drop List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="pdfTemplates">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-3"
            >
              {templates.map((template, index) => (
                <Draggable
                  key={template.name}
                  draggableId={template.name}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="bg-white border border-[#E2E8F0] rounded-lg px-5 py-4 shadow-sm hover:shadow-md transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        {/* Drag Handle */}
                        <span
                          {...provided.dragHandleProps}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <FiGrid
                            className="text-[#94A3B8]"
                            size={18}
                          />
                        </span>

                        <div>
                          <p className="text-base font-semibold text-[#1C2C56]">
                            {template.name}
                          </p>
                          <p className="text-sm text-[#64748B]">
                            {template.description}
                          </p>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <button className="text-[#1C2C56] hover:text-[#0F172A]">
                        <FiEdit2 size={18} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default PdfTemplatesTab;
