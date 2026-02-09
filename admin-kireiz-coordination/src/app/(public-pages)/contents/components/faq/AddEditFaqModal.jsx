"use client";

import { useEffect, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";

const AddEditFaqModal = ({ isOpen, onClose, mode = "add", initialData }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      setQuestion(initialData.question || "");
      setAnswer(initialData.answer || "");
      return;
    }

    setQuestion("");
    setAnswer("");
  }, [mode, initialData, isOpen]);

  const handleSave = ({ keepOpen }) => {
    const payload = {
      question,
      answer,
    };

    if (mode === "edit") {
      console.log("EDIT FAQ:", payload);
    } else {
      console.log("ADD FAQ:", payload);
    }

    if (keepOpen && mode !== "edit") {
      setQuestion("");
      setAnswer("");
      return;
    }

    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={onClose}
      className="w-full md:min-w-[620px] mx-auto"
    >
      <div className="flex flex-col">
        <div className="border-b p-2 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-[#1C2C56]">
            {mode === "edit" ? "Edit FAQ" : "Create FAQ"}
          </h2>
        </div>

        <div className="md:px-5 py-5 space-y-5 overflow-y-auto">
          <div>
            <label className="text-[#1C2C56] text-base font-medium">
              Question<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Type your question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
            />
          </div>

          <div>
            <label className="text-[#1C2C56] text-base font-medium">
              Answer<span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Type the answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm h-[140px] resize-none focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
            />
          </div>
        </div>

        <div className="border-t px-6 py-4 flex justify-end sm:flex-row flex-col gap-3">
          <Button variant="plain" onClick={onClose} size="sm">
            Cancel
          </Button>

          <Button
            variant="plain"
            size="sm"
            onClick={() => handleSave({ keepOpen: true })}
          >
            Save & Add Another
          </Button>

          <Button
            variant="solid"
            size="sm"
            className="bg-[#1C2C56] px-6 hover:bg-[#1C2C56] text-white py-2 rounded-md"
            onClick={() => handleSave({ keepOpen: false })}
          >
            {mode === "edit" ? "Update" : "Save"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default AddEditFaqModal;
