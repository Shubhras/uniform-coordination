import RentalTimeline from "./RentalTimeline";

// export default function Page({ params }) {
//   return <RentalTimeline orderId={params.orderId} />;
// }

export default async function Page({ params }) {
  const { orderId } = await params;

  return <RentalTimeline orderId={orderId} />;
}
