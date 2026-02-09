"use client";

import { useMemo, useState } from "react";
import { FiEdit2, FiMinus, FiPlus, FiSearch } from "react-icons/fi";
import AddEditFaqModal from "./AddEditFaqModal";

const initialFaqs = [
  {
    id: "faq-1",
    question: "Can I request samples?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: "faq-2",
    question: "What is the minimum order quantity and lead time?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
  },
  {
    id: "faq-3",
    question: "Support and contact details",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
  },
];

const FaqTab = () => {
  const [search, setSearch] = useState("");
  const [openFaqId, setOpenFaqId] = useState("faq-2");
  const [openModal, setOpenModal] = useState(false);
  const [editFaq, setEditFaq] = useState(null);
  const [faqs] = useState(initialFaqs);

  const filteredFaqs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return faqs;
    return faqs.filter((faq) =>
      faq.question.toLowerCase().includes(term)
    );
  }, [faqs, search]);

  return (
    <>
      <div className="bg-white rounded-xl shadow md:p-6 p-3">
        <div className="flex justify-between sm:flex-row flex-col items-start gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-semibold text-[#1C2C56]">FAQ’s</h2>
            <p className="text-base text-[#486284]">
              Manage frequently asked questions
            </p>
          </div>

          <button
            className="bg-[#1C2C56] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
            onClick={() => {
              setEditFaq(null);
              setOpenModal(true);
            }}
          >
            <FiPlus size={16} />
            Add FAQ
          </button>
        </div>

        <div className="max-w-5xl mx-auto space-y-4">
          <p className="text-center text-[#1C2C56] md:text-2xl text-xl">
            About design and coordination flow
          </p>

          {filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-xl px-6 py-5 transition-all duration-300 ${isOpen ? "bg-white shadow-md" : "bg-[#F5F7FB]"
                  }`}
              >
                <div className="w-full flex items-start justify-between text-left gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaqId(isOpen ? null : faq.id)
                    }
                    className="flex-1 flex items-start justify-between text-left gap-4"
                  >
                    <span className="text-[#1C2C56] font-medium text-sm md:text-base">
                      {faq.question}
                    </span>

                    <span className="text-[#1C2C56] text-xl">
                      {isOpen ? <FiMinus /> : <FiPlus />}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="text-[#1C2C56] hover:text-[#0F172A]"
                    onClick={(event) => {
                      event.stopPropagation();
                      setEditFaq(faq);
                      setOpenModal(true);
                    }}
                  >
                    <FiEdit2 size={18} />
                  </button>
                </div>

                {isOpen && faq.answer && (
                  <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                )}

              </div>
            );
          })}
        </div>
      </div>

      <AddEditFaqModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        mode={editFaq ? "edit" : "add"}
        initialData={editFaq}
      />
    </>
  );
};

export default FaqTab
