import ApiService from "./ApiService";

export async function apiCreateOrder(token, data) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/userhub/create/order/",
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: data,
  });
}

export async function apiApplyPromocode(token, data) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/uniformAdmin/promocode/list/",
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: data,
  });
}

export async function apiOverviewData(token, data) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/userhub/order/id/",
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: data,
  });
}

export async function apiGetOverviewSummary(token, data) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/order/summary/`,
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: data,
  });
}

export async function apiUserOrderList(token, params) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/userhub/user/order/list/",
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: params,
  });
}

export async function apiSindleOrderDetials(token, id) {
  const data = { "order_id": id }
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/order/${id}/get/`,
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: data,
  });
}
