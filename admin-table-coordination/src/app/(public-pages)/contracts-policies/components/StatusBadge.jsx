export const getStatusColors = (status) => {
  const normalizedStatus = status?.toLowerCase();

  if (normalizedStatus === "signed") {
    return {
      badge: "bg-[#DDF8EF] text-[#1BA97C]",
      dot: "bg-[#1BA97C]",
      accent: "text-[#1BA97C]",
    };
  }

  return {
    badge: "bg-[#F1EEFF] text-[#7A63FF]",
    dot: "bg-[#7A63FF]",
    accent: "text-[#D67A2E]",
  };
};

const StatusBadge = ({ status }) => {
  const colors = getStatusColors(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${colors.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      {status}
    </span>
  );
};

export default StatusBadge;
