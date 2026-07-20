import RentalTimeline from "./RentalTimeline";

export default function Page({ params }) {
  return <RentalTimeline orderId={params.orderId} />;
}
