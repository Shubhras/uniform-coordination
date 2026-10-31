import ApiService from "./ApiService";

export async function apiGetPrivacyPolicyList(
  accessToken,
  privacyPolicyType = "privacy_and_policy",
  type = "table"
) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/privacy-policy/list/?type=${type}&privacyPolicyType=${privacyPolicyType}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiCreatePrivacyPolicy(accessToken, payload) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/privacy-policy/create/`,
    method: "post",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetPrivacyPolicyDetail(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/privacy-policy/detail/${id}/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiUpdatePrivacyPolicy(accessToken, id, payload) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/privacy-policy/update/${id}/`,
    method: "put",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiDeletePrivacyPolicy(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/privacy-policy/delete/${id}/`,
    method: "delete",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
