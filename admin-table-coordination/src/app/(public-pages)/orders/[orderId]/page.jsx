import OrderDetails from "./orderDetails";

export default function Page({ params }) {
  return <OrderDetails orderId={params.orderId} />;
}