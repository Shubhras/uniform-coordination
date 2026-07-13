import ApiService from "./ApiService";

export async function apiCreateOrder(token, data) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/create/order/",
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: data,
  });
}


export async function apiApplyPromocode(token, data) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/promocode/list/",
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: data,
  });
}


export async function apiOverviewData(token, data) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/order/id/",
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: data,
  });
}


export async function apiGetOverviewSummary(token, data) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/order/summary/",
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: data,
  });
}
