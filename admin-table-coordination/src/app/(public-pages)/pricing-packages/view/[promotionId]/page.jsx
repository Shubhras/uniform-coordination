import PromotionDetails from "./PromotionDetails";

export default async function Page({ params }) {
  return <PromotionDetails promotionId={params.promotionId} />;
}
