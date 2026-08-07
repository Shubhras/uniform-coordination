import ApiService from "./ApiService";

const authHeader = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
});

export async function apiGetQuotationHistory(
  accessToken,
  { page = 1, pageSize = 10, status = "", search = "" } = {},
) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (status) params.set("status", status);
  if (search) params.set("search", search);

  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/quotation-history/?${params.toString()}`,
    method: "get",
    headers: authHeader(accessToken),
  });
}

export async function apiResendQuotation(accessToken, quotationId) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/quotation-history/${quotationId}/resend/`,
    method: "post",
    headers: authHeader(accessToken),
  });
}

// Generates the PDF from the active quotation template and returns its URL.
export async function apiExportQuotationPdf(accessToken, quotationId) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/quotationrequesttamplate/${quotationId}/export/`,
    method: "get",
    headers: authHeader(accessToken),
  });
}
