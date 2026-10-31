import ApiService from "./ApiService";

const authHeader = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
});

/**
 * Fetch list of privacy policy or terms & conditions
 * @param {string} accessToken
 * @param {"privacy_and_policy" | "terms_and_conditions"} privacyPolicyType
 * @param {"table"} type
 */
export async function apiGetPrivacyPolicyList(
  accessToken,
  privacyPolicyType = "privacy_and_policy",
  type = "table"
) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/privacy-policy/list/?type=${type}&privacyPolicyType=${privacyPolicyType}`,
    method: "get",
    headers: authHeader(accessToken),
  });
}

/**
 * Create a new privacy policy or terms & conditions document
 * @param {string} accessToken
 * @param {object} payload
 */
export async function apiCreatePrivacyPolicy(accessToken, payload) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/privacy-policy/create/",
    method: "post",
    data: payload,
    headers: authHeader(accessToken),
  });
}

/**
 * Update an existing privacy policy or terms & conditions document
 * @param {string} accessToken
 * @param {string|number} id
 * @param {object} payload
 */
export async function apiUpdatePrivacyPolicy(accessToken, id, payload) {
  try {
    return await ApiService.fetchDataWithAxios({
      url: `/v1/space/uniformAdmin/privacy-policy/update/${id}/`,
      method: "put",
      data: payload,
      headers: authHeader(accessToken),
    });
  } catch (error) {
    // Fallback if the space prefix is not used on this deployment
    if (error?.response?.status === 404) {
      return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/privacy-policy/update/${id}/`,
        method: "put",
        data: payload,
        headers: authHeader(accessToken),
      });
    }
    throw error;
  }
}
