import ContractStatus from "./ContractStatus";

export default async function Page({ params }) {
  const { contractId } = await params;

  return <ContractStatus contractId={contractId} />;
}
