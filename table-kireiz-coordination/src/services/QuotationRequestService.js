import ApiService from './ApiService';

/**
 * Submits custom table design quotation request to backend service.
 * 
 * @param {Object} data - Quotation payload containing design configuration and contact details.
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response confirming quotation submission.
 */
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
 * Exports custom quotation request summary as PDF document URL.
 * 
 * @param {string|number} id - Target quotation request ID.
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response containing quotation PDF export URL.
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