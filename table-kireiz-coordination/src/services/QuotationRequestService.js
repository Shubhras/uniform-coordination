import ApiService from './ApiService';

export async function apiCreateQuotationRequest(data, token) {
    return ApiService.fetchDataWithAxios({
        url: "/v1/space/userhub/quotationrequest/create/",
        method: "post",
        data,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}
/**
 * Export quotation PDF
 */
export async function apiExportQuotationPdf(id, token) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/space/userhub/quotationrequest/${id}/export/`,
        method: "get",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        responseType: "json",
    });
}