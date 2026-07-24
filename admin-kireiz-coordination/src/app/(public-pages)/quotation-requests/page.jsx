import QuotationHistory from "../customer/components/quotation-history/QuotationHistory";

const QuotationRequest = () => {
  return (
    <div className="bg-white rounded-xl p-6">
      {/* <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1C2C56]">
          Quotation Requests
        </h1>
        <p className="text-[#486284] text-sm">Manage all quotation requests</p>
      </div> */}

      <QuotationHistory />
    </div>
  );
};

export default QuotationRequest;
