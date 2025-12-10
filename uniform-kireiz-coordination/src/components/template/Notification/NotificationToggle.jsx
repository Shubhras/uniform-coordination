import classNames from "@/utils/classNames";
import Badge from "@/components/ui/Badge";
import { PiBellDuotone, PiBellLight } from "react-icons/pi";

const NotificationToggle = ({ className, dot }) => {
  return (
    <div
      className={classNames(
        "text-4xl bg-white p-2 rounded-xlg text-[#1C2C56]",
        className
      )}
    >
      {dot ? (
        <Badge badgeStyle={{ top: "3px", right: "6px" }}>
          <PiBellLight className="text-[#1C2C56]" />
        </Badge>
      ) : (
        <PiBellLight className="text-[#1C2C56]" />
      )}
    </div>
  );
};

export default NotificationToggle;
