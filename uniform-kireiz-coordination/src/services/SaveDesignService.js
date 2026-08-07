import ApiService from "./ApiService";

/**
 * Creates model info entry.
 *
 * @param {Object} data - Model information payload.
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response with created model info.
 */
export async function apiModelInfoCreate(data, token) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/modelinfo/create/",
    method: "post",
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Saves a new custom model design.
 *
 * @param {Object} data - Design configuration payload.
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response with saved design details.
 */
export async function apiSaveDesign(data, token) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/customupdatemodels/create/",
    method: "post",
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Updates an existing custom model design by ID.
 *
 * @param {string|number} id - Custom model design ID.
 * @param {Object} data - Updated design payload.
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response with updated design details.
 */
export async function apiUpadteDesign(id, data, token) {
  console.log("apiUpadteDesign", id, data);
  return ApiService.fetchDataWithAxios({
    url: `/v1/userhub/customupdatemodels/${id}/update/`,
    method: "put",
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Exports a custom model design to PDF document format.
 *
 * @param {string|number} id - Custom model design ID.
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response containing PDF export file URL.
 */
export async function apiExportDesignPdf(id, token) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/userhub/customupdatemodels/${id}/export/`,
    method: "get",
    responseType: "json",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Fetches model design info by ID.
 *
 * @param {string|number} id - Custom model design ID.
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response with model information.
 */
export async function apiGetModalInfo(id, token) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/userhub/customupdatemodels/${id}/get/`,
    responseType: "json",
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

