"use client";
import { useMemo, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Dropdown from "@/components/ui/Dropdown";
import classNames from "classnames";
import withHeaderItem from "@/utils/hoc/withHeaderItem";
import { HiCheck } from "react-icons/hi";
import { setLocale } from "@/server/actions/locale";
import { useLocale } from "next-intl";
import { FiChevronDown } from "react-icons/fi";

const languageList = [
  { label: "English", value: "en", flag: "US" },
  { label: "Japanese", value: "ja", flag: "JP" },
];

const _LanguageSelector = ({ className }) => {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const selectLangFlag = useMemo(() => {
    return languageList.find((lang) => lang.value === locale)?.flag;
  }, [locale]);

  const handleUpdateLocale = async (locale) => {
    await setLocale(locale);
  };

  const selectedLang = useMemo(() => {
    return languageList.find((lang) => lang.value === locale);
  }, [locale]);

  const selectedLanguage = (
    <div
      className={classNames(
        className,
        "group flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 transition-all duration-200 hover:bg-white",
      )}
    >
      <Avatar
        size={22}
        shape="circle"
        src={`/img/countries/${selectLangFlag}.png`}
      />

      <span className="text-sm font-semibold text-white transition-colors duration-200 group-hover:text-[#1C2C56]">
        {selectedLang?.flag}
      </span>

      <FiChevronDown
        size={15}
        className={`transition-all duration-200 ${
          isOpen ? "rotate-180" : ""
        } text-white group-hover:text-[#1C2C56]`}
      />
    </div>
  );

  return (
    <Dropdown
      renderTitle={selectedLanguage}
      placement="bottom-end"
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
    >
      {languageList.map((lang) => (
        <Dropdown.Item
          key={lang.label}
          className="justify-between"
          eventKey={lang.label}
          onClick={() => handleUpdateLocale(lang.value)}
        >
          <span className="flex items-center">
            <Avatar
              size={18}
              shape="circle"
              src={`/img/countries/${lang.flag}.png`}
            />
            <span className="ltr:ml-2 rtl:mr-2">{lang.label}</span>
          </span>
          {locale === lang.value && (
            <HiCheck className="text-emerald-500 text-lg" />
          )}
        </Dropdown.Item>
      ))}
    </Dropdown>
  );
};

const LanguageSelector = withHeaderItem(_LanguageSelector);

export default LanguageSelector;
