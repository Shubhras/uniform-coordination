import ApiService from "./ApiService";

export async function apiPrivatePolicy(policyType) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/privacy-policy/list/?type=uniform&privacyPolicyType=${policyType}`,
    method: "get",
  });
}