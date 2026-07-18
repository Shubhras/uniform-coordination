import ContractStatusPage from "../../components/ContractStatusPage";

const statusContracts = {
  "CTR-2024-0891": {
    contractId: "CTR-2024-0891",
    status: "Sent",
    timeline: [
      { title: "Generated", date: "Nov 12, 2024", state: "done" },
      { title: "Sent via CloudSign", date: "Nov 13, 2024", state: "done" },
      { title: "Viewed by Recipient", date: "Pending", state: "pending" },
      { title: "Awaiting Signature", date: "Pending", state: "pending" },
    ],
    activityHistory: [
      { title: "Contract generated", date: "Nov 14, 2024 - 10:22 AM" },
      { title: "Sent via CloudSign to s.harlow@meridianeventgroup.com", date: "Nov 14, 2024 - 10:35 AM" },
    ],
    statusSummary: {
      currentStatus: "Sent",
      cloudsign: "Awaiting Signature",
      contractValue: "¥38,500",
      generatedOn: "Nov 12, 2024",
    },
    documents: [
      { label: "Contract PDF", enabled: true },
      { label: "Signed PDF", enabled: false },
    ],
  },
  "CTR-2024-0892": {
    contractId: "CTR-2024-0892",
    status: "Signed",
    timeline: [
      { title: "Generated", date: "Nov 5, 2024", state: "done" },
      { title: "Sent via CloudSign", date: "Nov 6, 2024", state: "done" },
      { title: "Viewed by Recipient", date: "Nov 7, 2024", state: "done" },
      { title: "Signed", date: "Nov 9, 2024", state: "complete" },
    ],
    activityHistory: [
      { title: "Contract generated", date: "Nov 14, 2024 - 10:22 AM" },
      { title: "Sent via CloudSign to s.harlow@meridianeventgroup.com", date: "Nov 14, 2024 - 10:35 AM" },
      { title: "Contract opened by Marcus Osei", date: "Nov 7, 2024 - 2:14 PM" },
      { title: "Contract signed digitally", date: "Nov 9, 2024 - 4:08 PM" },
    ],
    statusSummary: {
      currentStatus: "Signed",
      cloudsign: "Signed",
      contractValue: "¥38,500",
      generatedOn: "Nov 12, 2024",
    },
    documents: [
      { label: "Contract PDF", enabled: true },
      { label: "Signed PDF", enabled: true },
    ],
  },
};

const buildFallbackStatusContract = (contractId) => ({
  contractId,
  status: contractId === "CTR-2024-0894" ? "Signed" : "Sent",
  timeline: [
    { title: "Generated", date: "Nov 18, 2024", state: "done" },
    { title: "Sent via CloudSign", date: "Nov 18, 2024", state: "done" },
    { title: "Viewed by Recipient", date: "Pending", state: "pending" },
    {
      title: contractId === "CTR-2024-0894" ? "Signed" : "Awaiting Signature",
      date: contractId === "CTR-2024-0894" ? "Nov 19, 2024" : "Pending",
      state: contractId === "CTR-2024-0894" ? "complete" : "pending",
    },
  ],
  activityHistory: [
    { title: "Contract generated", date: "Nov 18, 2024 - 9:00 AM" },
    { title: "Sent via CloudSign to events@kireizspace.example.com", date: "Nov 18, 2024 - 9:15 AM" },
  ],
  statusSummary: {
    currentStatus: contractId === "CTR-2024-0894" ? "Signed" : "Sent",
    cloudsign: contractId === "CTR-2024-0894" ? "Signed" : "Awaiting Signature",
    contractValue: "¥18,500",
    generatedOn: "Nov 18, 2024",
  },
  documents: [
    { label: "Contract PDF", enabled: true },
    { label: "Signed PDF", enabled: contractId === "CTR-2024-0894" },
  ],
});

export default function ContractStatus({ contractId }) {
  const contract =
    statusContracts[contractId] || buildFallbackStatusContract(contractId);

  return <ContractStatusPage contract={contract} />;
}
