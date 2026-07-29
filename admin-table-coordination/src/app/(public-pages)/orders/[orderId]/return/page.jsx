import ProcessReturn from "./ProcessReturn";

export default function Page({ params }) {
  return <ProcessReturn orderId={params.orderId} />;
}
