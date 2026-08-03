import ApiService from "./ApiService";

/**
 * Fetches legal policy document (privacy policy, terms and conditions, or agreement).
 * 
 * @param {string} policyType - Type of policy to retrieve ('privacy_policy' | 'terms_and_conditions' | 'agreement').
 * @returns {Promise<Object>} API response with policy document content.
 */
export async function apiPrivatePolicy(policyType) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/privacy-policy/list/?type=table&privacyPolicyType=${policyType}`,
    method: "get",
  });
}