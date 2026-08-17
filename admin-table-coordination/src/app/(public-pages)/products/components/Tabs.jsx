import { useLocale } from "next-intl";
import {
  FiLayers,
  FiDroplet,
  FiMaximize2,
  FiSliders,
  FiBookmark,
  FiGrid,
  FiBox
} from "react-icons/fi";
import { useTranslations } from "next-intl";


const tabLabels = {
  Fabrics: { en: "Fabrics", ja: "生地" },
  Colors: { en: "Colors", ja: "カラー" },
  TableShape: { en: "Table Shape", ja: "テーブル形状" },
  Closure: { en: "Closure", ja: "クロージャー" },
  Style: { en: "Style", ja: "スタイル" },
  Size: { en: "Size", ja: "サイズ" },
  Pattern: { en: "Pattern", ja: "パターン" },
};

const tabs = [
  { key: "Fabrics", label: "fabrics", icon: FiLayers },
  { key: "Colors", label: "colors", icon: FiDroplet },
  { key: "TableShape", label: "tableShape", icon: FiGrid },
  { key: "Closure", label: "closure", icon: FiSliders },
  { key: "Style", label: "style", icon: FiBookmark },
  { key: "Size", label: "size", icon: FiMaximize2 },
  { key: "Pattern", label: "pattern", icon: FiBox },
];

const Tabs = ({ activeTab, setActiveTab }) => {
    const t = useTranslations("productSpecification.tabs");
  return (
    <div className="flex gap-6 border-b border-[#90A3BF9C] mt-6 overflow-x-auto">
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`pb-2 text-base font-medium flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
            activeTab === key
              ? "text-[#000000] border-b-3 border-[#A85A32]"
              : "text-[#64748B] border-transparent"
          }`}
        >
          <Icon size={16} />
          {t(label)}
        </button>
      ))}
    </div>
  );
};

export default Tabs;




//   { key: "Fabrics", icon: FiLayers },
//   { key: "Colors", icon: FiDroplet },
//   { key: "TableShape", icon: FiGrid },
//   { key: "Closure", icon: FiSliders },
//   { key: "Style", icon: FiBookmark },
//   { key: "Size", icon: FiMaximize2 },
//   { key: "Pattern", icon: FiBox },
// ];

// const Tabs = ({ activeTab, setActiveTab }) => {
//   const locale = useLocale();
//   const lang = locale === "ja" ? "ja" : "en";

//   return (
//     <div className="flex gap-6 border-b border-[#90A3BF9C] mt-6 overflow-x-auto">
//       {tabs.map(({ key, icon: Icon }) => {
//         const label = tabLabels[key]?.[lang] || key;
//         return (
//           <button
//             key={key}
//             onClick={() => setActiveTab(key)}
//             className={`pb-2 text-base font-medium flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
//               activeTab === key
//                 ? "text-[#1C2C56] border-[#1C2C56]"
//                 : "text-[#64748B] border-transparent hover:text-[#1C2C56]"
//             }`}
//           >
//             <Icon size={16} />
//             {label}
//           </button>
//         );
//       })}