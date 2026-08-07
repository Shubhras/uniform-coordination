import ApiService from "./ApiService";

/**
 * Fetches privacy policy document details by policy type.
 *
 * @param {string} policyType - Type of privacy policy requested.
 * @returns {Promise<Object>} API response containing privacy policy details.
 */
export async function apiPrivatePolicy(policyType) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/privacy-policy/list/?type=uniform&privacyPolicyType=${policyType}`,
    method: "get",
  });
}