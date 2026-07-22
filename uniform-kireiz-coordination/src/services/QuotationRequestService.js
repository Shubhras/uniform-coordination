import ApiService from './ApiService';

export async function apiCreateQuotationRequest(data, token) {
    return ApiService.fetchDataWithAxios({
        url: "/v1/userhub/quotationrequest/create/",
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
        url: `/v1/userhub/quotationrequest/${id}/export/`,
        method: "get",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        responseType: "json",
    });
}

export async function apiGetUserQuotationDetail(id, token, absoluteUrl) {
    return ApiService.fetchDataWithAxios({
        url: absoluteUrl || `/v1/userhub/quotations/${id}/`,
        method: "get",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function apiGetQuotationRequestDetail(id, token) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/userhub/quotationrequest/${id}/get/`,
        method: "get",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function apiDownloadUserQuotationPdf(id, token, absoluteUrl) {
    return ApiService.fetchDataWithAxios({
        url: absoluteUrl || `/v1/userhub/quotations/${id}/pdf/`,
        method: "get",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
    });
}

export async function apiCancelQuotation(id, data, token) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/userhub/quotation/cancel/${id}/`,
        method: "patch",
        data,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
}
