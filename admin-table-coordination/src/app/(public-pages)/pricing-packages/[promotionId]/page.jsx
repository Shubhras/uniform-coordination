import PromotionDetails from "./PromotionDetails";

export default async function PromotionDetailsPage({ params }) {
  const { promotionId } = await params;

  return <PromotionDetails promotionId={promotionId} />;
}
