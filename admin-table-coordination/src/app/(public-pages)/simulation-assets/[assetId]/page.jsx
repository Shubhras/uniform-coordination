import ProductDetails from "./ProductDetails";

export default async function SimulationAssetDetailsPage({ params }) {
  const { assetId } = await params;

  return <ProductDetails assetId={assetId} />;
}
