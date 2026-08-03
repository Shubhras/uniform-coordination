import ApiService from "./ApiService";

/**
 * Creates 3D model information record.
 * 
 * @param {Object} data - Model information metadata payload.
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response with created model info ID.
 */
export async function apiModelInfoCreate(data, token) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/userhub/modelinfo/create/",
    method: "post",
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Saves customized 3D uniform design configuration to user library.
 * 
 * @param {Object} data - 3D design configuration payload containing textures, colors, and components.
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response with saved design configuration ID.
 */
export async function apiSaveDesign(data, token) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/userhub/customupdatemodels/create/",
    method: "post",
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Updates existing saved 3D design configuration by design ID.
 * 
 * @param {string|number} id - Target saved design ID.
 * @param {Object} data - Updated 3D design configuration payload.
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response confirming design configuration update.
 */
export async function apiUpadteDesign(id, data, token) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/customupdatemodels/${id}/update/`,
    method: "put",
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Exports saved 3D design spec sheet to PDF document.
 * 
 * @param {string|number} id - Target saved design ID.
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response containing PDF export file URL.
 */
export async function apiExportDesignPdf(id, token) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/customupdatemodels/${id}/export/`,
    method: "get",
    responseType: "json",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Fetches saved 3D design details and model info by design ID.
 * 
 * @param {string|number} id - Target saved design ID.
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response with 3D design configuration details.
 */
export async function apiGetModalInfoDesignById(id, token) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/customupdatemodels/${id}/get/`,
    responseType: "json",
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

