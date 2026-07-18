import EditPromotion from "./EditPromotion";

export default async function EditPromotionPage({ params }) {
  const { promotionId } = await params;

  return <EditPromotion promotionId={promotionId} />;
}
