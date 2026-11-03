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
  status = "",
  type = "",
  customertype = "",
  search = "",
) {
  const params = new URLSearchParams({
    page,
    page_size: pageSize,
  });

  if (status && status !== "all") {
    params.append("status", status);
  }
  if (type && type !== "all") {
    params.append("type", type);
  }
  if (customertype && customertype !== "all") {
    params.append("customertype", customertype);
  }
  if (search) {
    params.append("search", search);
  }

  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/promocode/list/?${params.toString()}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiDeletePromoCode(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/promocode/delete/${id}/`,
    method: "delete",
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
    url: `/v1/space/uniformAdmin/promocode/update/${id}/`,
    method: "put",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetPricingList(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/settings/rental-policy/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiUpdatePricingList(accessToken, payload) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/uniformAdmin/settings/rental-policy/update/",
    method: "put",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
