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

/**
 * Fetches terms and conditions list from the space endpoint.
 * URL: /api/v1/space/uniformAdmin/privacy-policy/list/?type=table&privacyPolicyType=terms_and_conditions
 *
 * @param {Object} [params] - Optional query parameters.
 * @returns {Promise<Object>} API response containing terms & conditions list.
 */
export async function apiGetTermsAndConditions(params = {}) {
  const queryParams = {
    type: 'table',
    privacyPolicyType: 'terms_and_conditions',
    ...params,
  };
  const qs = new URLSearchParams(queryParams).toString();

  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/privacy-policy/list/?${qs}`,
    method: 'get',
  });
}

/**
 * Fetches privacy policy list from the uniformAdmin endpoint.
 * URL: /api/v1/uniformAdmin/privacy-policy/list/?type=table&privacyPolicyType=privacy_and_policy
 *
 * @param {Object} [params] - Optional query parameters.
 * @returns {Promise<Object>} API response containing privacy policy list.
 */
export async function apiGetPrivacyPolicy(params = {}) {
  const queryParams = {
    type: 'table',
    privacyPolicyType: 'privacy_and_policy',
    ...params,
  };
  const qs = new URLSearchParams(queryParams).toString();

  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/privacy-policy/list/?${qs}`,
    method: 'get',
  });
}