import ContractDetails from "./ContractDetails";

export default async function Page({ params }) {
  const { contractId } = await params;

  return <ContractDetails contractId={contractId} />;
}
