import ApiService from './ApiService';

/**
 * Submits a new quotation request.
 *
 * @param {Object} data - Quotation request data payload.
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response with created quotation request details.
 */
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
 * Exports quotation request details to a PDF format.
 *
 * @param {string|number} id - Quotation request ID.
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response containing exported PDF details.
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

/**
 * Fetches user quotation detail by ID or absolute URL.
 *
 * @param {string|number} id - Quotation ID.
 * @param {string} token - User authentication Bearer token.
 * @param {string} [absoluteUrl] - Optional full request URL override.
 * @returns {Promise<Object>} API response with quotation detail.
 */
export async function apiGetUserQuotationDetail(id, token, absoluteUrl) {
    return ApiService.fetchDataWithAxios({
        url: absoluteUrl || `/v1/userhub/quotations/${id}/`,
        method: "get",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

/**
 * Fetches quotation request detail by ID.
 *
 * @param {string|number} id - Quotation request ID.
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response with quotation request details.
 */
export async function apiGetQuotationRequestDetail(id, token) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/userhub/quotationrequest/${id}/get/`,
        method: "get",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

/**
 * Downloads user quotation PDF document as a blob object.
 *
 * @param {string|number} id - Quotation ID.
 * @param {string} token - User authentication Bearer token.
 * @param {string} [absoluteUrl] - Optional full request URL override.
 * @returns {Promise<Blob>} API response containing PDF file blob.
 */
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

/**
 * Cancels a quotation request by ID.
 *
 * @param {string|number} id - Quotation request ID to cancel.
 * @param {Object} data - Cancellation reason or parameters payload.
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response confirming quotation cancellation.
 */
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
