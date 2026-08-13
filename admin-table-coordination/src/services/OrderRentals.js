import ApiService from "./ApiService";

export async function apiOrderRentalLists(
  accessToken,
  page = 1,
  pageSize = 10,
  search = "",
  role = "",
  status = "",
) {
  const params = new URLSearchParams({
    page,
    page_size: pageSize,
  });

  if (search) {
    params.append("search", search);
  }
  if (role && role !== "all") params.append("role", role);
  if (status && status !== "all") params.append("status", status);

  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/orderlist/get/?${params.toString()}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiOrderRentalDetails(accessToken, orderId) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/orderdetail/${orderId}/get/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiOrderUpdate(accessToken, orderId, payload) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/order/update/${orderId}/`,
    method: "patch",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiProcessReturnDetails(
  accessToken,
  search = "",
  status = "",
) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/rental-order/items/?search=${search}&status=${status}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetOrCreateLateFeeInvoice(accessToken, orderId) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/rental-order/late-fee/${orderId}/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiNotifyLateFeeCustomer(accessToken, orderId, payload) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/rental-order/late-fee/${orderId}/notify/`,
    method: "post",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetOrCreateCompensationInvoice(accessToken, orderId) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/rental-order/compensation/${orderId}/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGenerateCompensationInvoice(accessToken, orderId, payload = {}) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/rental-order/compensation/${orderId}/generate/`,
    method: "post",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
