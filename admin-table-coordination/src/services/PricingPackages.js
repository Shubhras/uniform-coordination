import ApiService from "./ApiService";

export async function apiCreatePromoCode(accessToken, formData) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/promocode/create/`,
    method: "post",
    data: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function apiGetPromoCodeList(
  accessToken,
  page = 1,
  pageSize = 10,
) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/promocode/list/?page=${page}&page_size=${pageSize}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiPromoCodeDetails(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/promocode/detail/${id}/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiUpdatePromotion(accessToken, id, payload) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/promocode/${id}/update/`,
    method: "patch",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
export async function apiGetPricingList(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/pricing-rules/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
