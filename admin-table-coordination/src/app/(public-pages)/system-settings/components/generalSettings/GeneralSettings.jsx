"use client";

import Select from "react-select";
import { FiImage } from "react-icons/fi";

const supportEmailOptions = [
  { value: "support@kireizspace.jp", label: "support@kireizspace.jp" },
];

const phoneOptions = [
  { value: "+81 3-1234-5678", label: "+81 3-1234-5678" },
];

const languageOptions = [
  { value: "Japanese", label: "Japanese" },
];

const currencyOptions = [
  { value: "JPY (¥)", label: "JPY (¥)" },
];

const timeZoneOptions = [
  { value: "(GMT+09:00) Tokyo", label: "(GMT+09:00) Tokyo" },
];

const dateFormatOptions = [
  { value: "YYYY/MM/DD", label: "YYYY/MM/DD" },
];

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "42px",
    borderColor: "#F2E5DD",
    borderRadius: "12px",
    boxShadow: "none",
    fontSize: "12px",
    backgroundColor: "#FFFCFA",
    "&:hover": { borderColor: "#E2CFC2" },
  }),
  valueContainer: (base) => ({ ...base, paddingLeft: "8px", paddingRight: "8px" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, color: "#B7774D", paddingRight: "10px" }),
  menu: (base) => ({ ...base, zIndex: 30 }),
  option: (base, state) => ({
    ...base,
    fontSize: "12px",
    backgroundColor: state.isSelected ? "#B56735" : state.isFocused ? "#FCF4EF" : "#FFFFFF",
    color: state.isSelected ? "#FFFFFF" : "#6F625B",
  }),
};

const FieldLabel = ({ children }) => (
  <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">
    {children}
  </p>
);

const textInputClassName =
  "h-[42px] w-full rounded-[12px] border border-[#F2E5DD] bg-[#FFFCFA] px-4 text-[12px] text-[#5C4F48] outline-none placeholder:text-[#BBA99D]";

const GeneralSettings = () => {
  return (
    <div className="mt-5 rounded-[14px] border border-[#F0E4DB] bg-white p-4 sm:p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FieldLabel>Company Name</FieldLabel>
          <input
            type="text"
            readOnly
            value="KIREIZ SPACE Co, Ltd."
            className={textInputClassName}
          />
        </div>

        <div>
          <FieldLabel>Business Address</FieldLabel>
          <input
            type="text"
            readOnly
            value="1-2-3 Minami-Aoyama, Minato-ku, Tokyo 107-0062, Japan"
            className={textInputClassName}
          />
        </div>

        <div>
          <FieldLabel>Support Email</FieldLabel>
          <Select
            instanceId="system-settings-support-email"
            inputId="system-settings-support-email"
            value={supportEmailOptions[0]}
            options={supportEmailOptions}
            isSearchable={false}
            styles={selectStyles}
          />
        </div>

        <div>
          <FieldLabel>Contact Number</FieldLabel>
          <Select
            instanceId="system-settings-contact-number"
            inputId="system-settings-contact-number"
            value={phoneOptions[0]}
            options={phoneOptions}
            isSearchable={false}
            styles={selectStyles}
          />
        </div>

        <div>
          <FieldLabel>Default Language</FieldLabel>
          <Select
            instanceId="system-settings-language"
            inputId="system-settings-language"
            value={languageOptions[0]}
            options={languageOptions}
            isSearchable={false}
            styles={selectStyles}
          />
        </div>

        <div>
          <FieldLabel>Default Currency</FieldLabel>
          <Select
            instanceId="system-settings-currency"
            inputId="system-settings-currency"
            value={currencyOptions[0]}
            options={currencyOptions}
            isSearchable={false}
            styles={selectStyles}
          />
        </div>

        <div>
          <FieldLabel>Time Zone</FieldLabel>
          <Select
            instanceId="system-settings-timezone"
            inputId="system-settings-timezone"
            value={timeZoneOptions[0]}
            options={timeZoneOptions}
            isSearchable={false}
            styles={selectStyles}
          />
        </div>

        <div>
          <FieldLabel>Date Format</FieldLabel>
          <Select
            instanceId="system-settings-date-format"
            inputId="system-settings-date-format"
            value={dateFormatOptions[0]}
            options={dateFormatOptions}
            isSearchable={false}
            styles={selectStyles}
          />
        </div>
      </div>

      <div className="mt-4">
        <FieldLabel>Logo</FieldLabel>
        <div className="rounded-[14px] border border-dashed border-[#EADBCF] bg-[#FFFDFC] px-4 py-10 text-center">
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF3EB] text-[#A85A32]">
            <FiImage size={14} />
          </div>
          <p className="mt-3 text-[13px] font-medium text-[#4A3D36]">Upload Logo</p>
          <p className="mt-1 text-[10px] text-[#BBA99D]">PNG or JPG up to 5 MB</p>
          <button
            type="button"
            className="mt-4 rounded-full border border-[#E4B38E] px-5 py-1.5 text-[11px] font-medium text-[#B56735]"
          >
            Browse Files
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          className="rounded-full border border-[#EAD9CD] px-5 py-2 text-[12px] text-[#7F736B]"
        >
          Cancel
        </button>
        <button
          type="button"
          className="rounded-full bg-[#B56735] px-5 py-2 text-[12px] font-medium text-white"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default GeneralSettings;
