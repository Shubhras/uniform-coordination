import ApiService from "./ApiService";

/**
 * Fetches legal policy document (privacy policy, terms and conditions, or agreement).
 * 
 * @param {string} [policyType='terms_and_conditions'] - Type of policy to retrieve ('privacy_and_policy' | 'terms_and_conditions' | 'terms_condition' | 'agreement').
 * @returns {Promise<Object>} API response with policy document content.
 */
export async function apiPrivatePolicy(policyType = 'terms_and_conditions') {
  const normalizedType = policyType === 'terms_condition' ? 'terms_and_conditions' : policyType;
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/privacy-policy/list/?type=table&privacyPolicyType=${normalizedType}`,
    method: "get",
  });
}