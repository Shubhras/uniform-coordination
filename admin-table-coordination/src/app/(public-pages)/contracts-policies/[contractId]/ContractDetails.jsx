import ContractDetailPage from "../components/ContractDetailPage";

const sentTemplate = {
  status: "Sent",
  companyName: "ABC Hotels Pvt Ltd",
  businessEmail: "Merina.events@example.com",
  userType: "B2B",
  signedOnLabel: "Awaiting Signature",
  signedOnValue: "Awaiting Signature",
  contractStatusLabel: "Contract Status",
  contractStatusValue: "Awaiting Signature",
  venueType: "Wedding",
  requestedItemsNote: "4 items for 2-day rental period",
  downloads: ["Download Quotation PDF", "Download Contract PDF"],
  documents: [
    { label: "Contract PDF", enabled: true },
    { label: "Signed PDF", enabled: false },
  ],
};

const signedTemplate = {
  status: "Signed",
  companyName: "ABC Hotels Pvt Ltd",
  businessEmail: "Merina.events@example.com",
  userType: "B2B",
  signedOnLabel: "Signed Date",
  signedOnValue: "20 May 2024",
  contractStatusLabel: "Contract Status",
  contractStatusValue: "Completed",
  venueType: "Wedding",
  requestedItemsNote: "4 items for 2-day rental period",
  downloads: [
    "Download Quotation PDF",
    "Download Contract PDF",
    "Download Signed PDF",
  ],
  documents: [
    { label: "Contract PDF", enabled: true },
    { label: "Signed PDF", enabled: true },
  ],
};

const contractDetails = {
  "CTR-2024-0891": {
    ...sentTemplate,
    contractId: "CTR-2024-0891",
    contactPerson: "Priya Menon",
    phoneNumber: "(323) 585-6012",
    companyAddress: "Sakura Grand Hotel Co., Chiyoda-ku, Tokyo, 100-0005 Japan",
    quotationNo: "QT-2026-105",
    quotationDate: "20 May 2024",
    contractIdShort: "CT-2026-021",
    rentalStart: "12 Jun 2024",
    rentalEnd: "26 Jun 2024",
    venueName: "Grand Hyatt Tokyo",
    customerNotes:
      "We require the chandeliers to be installed no later than 6 AM on the 14th. All items must coordinate in gold and crystal tones, please confirm availability at your earliest convenience.",
    items: [
      { item: "Crystal Chandelier (Small)", category: "Lighting", requested: 4, availability: "Available (4)", unitRate: "¥850.00" },
      { item: "Rose Gold Candle Holder", category: "Centerpiece", requested: 30, availability: "Available (30)", unitRate: "¥35.00" },
      { item: "Silk Table Runner (Ivory)", category: "Linen", requested: 15, availability: "Available (15)", unitRate: "¥25.00" },
      { item: "Floral Arch", category: "Structures", requested: 1, availability: "Available (1)", unitRate: "¥550.00" },
    ],
    summary: { items: "4 line items", rentalDays: "2 days", subtotal: "¥12,000.00", discount: "-¥950.00", delivery: "¥350.00", total: "¥18,590.00" },
  },
  "CTR-2024-0892": {
    ...signedTemplate,
    contractId: "CTR-2024-0892",
    contactPerson: "John Kapoor",
    phoneNumber: "(401) 585-0128",
    companyAddress: "Sakura Grand Hotel Co., Chiyoda-ku, Tokyo, 100-0005 Japan",
    quotationNo: "QT-2026-105",
    quotationDate: "20 May 2024",
    contractIdShort: "CT-2026-021",
    rentalStart: "12 Jun 2024",
    rentalEnd: "26 Jun 2024",
    venueName: "Grand Hyatt Tokyo",
    customerNotes:
      "We require the chandeliers to be installed no later than 6 AM on the 14th. All items must coordinate in gold and crystal tones, please confirm availability at your earliest convenience.",
    items: [
      { item: "Crystal Chandelier (Small)", category: "Lighting", requested: 4, availability: "Available (4)", unitRate: "¥820.00" },
      { item: "Rose Gold Candle Holder", category: "Centerpiece", requested: 30, availability: "Available (30)", unitRate: "¥35.00" },
      { item: "Silk Table Runner (Ivory)", category: "Linen", requested: 15, availability: "Available (15)", unitRate: "¥25.00" },
      { item: "Floral Arch", category: "Structures", requested: 1, availability: "Available (1)", unitRate: "¥550.00" },
    ],
    summary: { items: "4 line items", rentalDays: "2 days", subtotal: "¥12,000.00", discount: "-¥950.00", delivery: "¥350.00", total: "¥18,590.00" },
  },
  "CTR-2024-0893": {
    ...sentTemplate,
    contractId: "CTR-2024-0893",
    contactPerson: "Aarav Shah",
    phoneNumber: "(415) 555-2231",
    companyAddress: "Lumina Studio HQ, Shibuya, Tokyo, 150-0002 Japan",
    quotationNo: "QT-2026-106",
    quotationDate: "21 May 2024",
    contractIdShort: "CT-2026-022",
    rentalStart: "14 Jun 2024",
    rentalEnd: "28 Jun 2024",
    venueName: "Lumina Garden Hall",
    customerNotes:
      "Please ensure all linens are ivory-toned and delivered a day early for setup.",
    items: [
      { item: "Silk Table Runner (Ivory)", category: "Linen", requested: 12, availability: "Available (12)", unitRate: "¥25.00" },
      { item: "Floral Arch", category: "Structures", requested: 1, availability: "Available (1)", unitRate: "¥550.00" },
      { item: "Rose Gold Candle Holder", category: "Centerpiece", requested: 20, availability: "Available (20)", unitRate: "¥35.00" },
    ],
    summary: { items: "3 line items", rentalDays: "2 days", subtotal: "¥9,500.00", discount: "-¥500.00", delivery: "¥300.00", total: "¥9,300.00" },
  },
};

const buildFallbackContract = (contractId) => {
  const isSigned = ["CTR-2024-0894"].includes(contractId);
  const template = isSigned ? signedTemplate : sentTemplate;

  return {
    ...template,
    contractId,
    contactPerson: isSigned ? "Kenji Sato" : "Meridian Team",
    phoneNumber: isSigned ? "(03) 4567-8901" : "(03) 1234-5678",
    companyAddress: "Tokyo Operations Center, Tokyo, Japan",
    quotationNo: "QT-2026-110",
    quotationDate: "24 May 2024",
    contractIdShort: `CT-${contractId.slice(-4)}`,
    rentalStart: "18 Jun 2024",
    rentalEnd: "20 Jun 2024",
    venueName: "Kireiz Event Hall",
    customerNotes: "Please keep the setup aligned with the selected event plan.",
    items: [
      { item: "Crystal Chandelier (Small)", category: "Lighting", requested: 2, availability: "Available (2)", unitRate: "¥850.00" },
      { item: "Rose Gold Candle Holder", category: "Centerpiece", requested: 12, availability: "Available (12)", unitRate: "¥35.00" },
    ],
    summary: { items: "2 line items", rentalDays: "2 days", subtotal: "¥5,400.00", discount: "-¥200.00", delivery: "¥300.00", total: "¥5,500.00" },
  };
};

export default function ContractDetails({ contractId }) {
  const contract = contractDetails[contractId] || buildFallbackContract(contractId);

  return <ContractDetailPage contract={contract} />;
}
