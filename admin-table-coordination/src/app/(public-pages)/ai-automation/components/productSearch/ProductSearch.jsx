"use client";

import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { apiProductSearch } from "@/services/AiAutomation";
import useCurrentSession from "@/utils/hooks/useCurrentSession";

const productSearchChips = [
  "White tablecloth for 8-seat round table",
  "Navy rectangular runner, 10 guests",
  "Gold chair sashes, wedding, 150 pcs",
  "Sheer organza overlay, blush pink",
];

const productResults = [
  {
    id: "result-1",
    title: "Premium Round Tablecloth — Ivory",
    subtitle: 'Round · Cotton · 120" dia.',
    price: "¥4,800/day",
    badge: "Best Match",
    badgeClass: "bg-[#E7FAF1] text-[#1CA174]",
    stock: "24 in stock",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "result-2",
    title: "Classic Round Tablecloth — White",
    subtitle: 'Round · Cotton · 120" dia.',
    price: "¥4,800/day",
    badge: "Available",
    badgeClass: "bg-[#EEF5FF] text-[#5A87D9]",
    stock: "54 in stock",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "result-3",
    title: "Premium Round Tablecloth — Ivory",
    subtitle: 'Round · Cotton · 120" dia.',
    price: "¥4,800/day",
    badge: "Best Match",
    badgeClass: "bg-[#E7FAF1] text-[#1CA174]",
    stock: "34 in stock",
    image:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "result-4",
    title: "Round Tablecloth — Champagne",
    subtitle: 'Round · Cotton · 120" dia.',
    price: "¥4,600/day",
    badge: "Limited",
    badgeClass: "bg-[#FFF2D9] text-[#C58B1E]",
    stock: "9 in stock",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "result-5",
    title: "Premium Round Tablecloth — Ivory",
    subtitle: 'Round · Cotton · 120" dia.',
    price: "¥4,800/day",
    badge: "Best Match",
    badgeClass: "bg-[#E7FAF1] text-[#1CA174]",
    stock: "26 in stock",
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "result-6",
    title: "Premium Round Tablecloth — Ivory",
    subtitle: 'Round · Cotton · 120" dia.',
    price: "¥4,800/day",
    badge: "Best Match",
    badgeClass: "bg-[#E7FAF1] text-[#1CA174]",
    stock: "24 in stock",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
  },
];

const ProductSearch = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [apiMessage, setApiMessage] = useState("");
  const [interpretedQuery, setInterpretedQuery] = useState([]);

  const handleProductSearch = async () => {
    if (!productSearchQuery.trim()) return;

    try {
      setLoading(true);
      setApiMessage("");
      setProducts([]);

      const res = await apiProductSearch(
        accessToken,
        productSearchQuery.trim(),
      );

      console.log("Product Search", res);

      if (res?.success) {
        setProducts(res?.data?.products || []);
        setInterpretedQuery(res?.data?.filters || []);
        setHasProductSearchResults(true);
      } else {
        setApiMessage(res?.message || "No products found.");
        setHasProductSearchResults(false);
      }
    } catch (err) {
      console.error(err);
      setApiMessage("Something went wrong.");
      setHasProductSearchResults(false);
    } finally {
      setLoading(false);
    }
  };

  const [productSearchQuery, setProductSearchQuery] = useState(
    "White tablecloth for 8-seat round table",
  );
  const [hasProductSearchResults, setHasProductSearchResults] = useState(false);

  return (
    <div className="mt-6">
      <h2 className="text-[24px] font-semibold leading-tight text-[#2A1A0E] sm:text-[24px]">
        Natural Language Product Search
      </h2>
      <p className="mt-1 text-[12px] text-[#B29D8C]">
        Describe what you need — AI converts your query into structured filters
      </p>

      <div className="mt-5 rounded-2xl border border-[#F1E5DC] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex flex-1 items-center rounded-xl border border-[#EFE3DA] bg-[#FFFCFA] px-4 py-2">
            <FiSearch size={13} className="mr-2 text-[#D7BDAA]" />
            <input
              type="text"
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
              className="w-full bg-transparent text-[12px] text-[#6C615A] outline-none placeholder:text-[#C7B4A8]"
              placeholder='Try: "White tablecloth for 8-seat round table"'
            />
          </div>
          <button
            type="button"
            onClick={handleProductSearch}
            disabled={loading || !productSearchQuery.trim()}
            className={`flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-1 text-[13px] font-medium text-white ${
              productSearchQuery.trim() && !loading
                ? "bg-[#A85A32]"
                : "bg-[#E4C4AE] cursor-not-allowed"
            }`}
          >
            <HiSparkles size={16} className="shrink-0" />
            {loading ? "Searching..." : "AI Search"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {productSearchChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setProductSearchQuery(chip);
              }}
              className="rounded-full border border-[#E8D9CD] bg-white px-4 py-1.5 text-[11px] text-[#6C615A]"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {!hasProductSearchResults ? (
        <div className="py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4EC] text-[#E4B58F]">
            <FiSearch size={18} />
          </div>
          <h3 className="mt-6 text-[20px] font-semibold text-[#3A2F2A]">
            Start with a natural language query
          </h3>
          <p className="mx-auto mt-2 max-w-[420px] text-[14px] leading-6 text-[#8B7355]">
            Describe the product you need — size, color, occasion, quantity —
            and our AI will handle the rest.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#FFF2E8] px-3 py-1 text-[10px] text-[#A66D48]">
              AI interpreted your query as:
            </span>
            <span className="rounded-full bg-[#FFF7F1] px-3 py-1 text-[10px] text-[#A66D48]">
              Color: White / Ivory
            </span>
            <span className="rounded-full bg-[#FFF7F1] px-3 py-1 text-[10px] text-[#A66D48]">
              Shape: Round
            </span>
            <span className="rounded-full bg-[#FFF7F1] px-3 py-1 text-[10px] text-[#A66D48]">
              Seats: 8 persons
            </span>
            <span className="rounded-full bg-[#FFF7F1] px-3 py-1 text-[10px] text-[#A66D48]">
              Type: Tablecloth
            </span>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-[12px] font-medium text-[#3A2F2A]">
              6 products matched
            </p>
            <p className="text-[10px] text-[#B29D8C]">Sorted by relevance</p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {productResults.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-[#EADFD6] bg-white"
              >
                <div className="aspect-[1.15/1] overflow-hidden px-3 pt-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full rounded-xl object-cover"
                  />
                </div>
                <div className="px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-[12px] font-semibold text-[#3A2F2A]">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-[10px] text-[#B09A8B]">
                        {item.subtitle}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${item.badgeClass}`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-[16px] font-semibold text-[#B76836]">
                      {item.price}
                    </p>
                    <p className="text-[10px] text-[#7CA46A]">{item.stock}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductSearch;
