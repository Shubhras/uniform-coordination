import ApiService from "./ApiService";

export async function apiOrderRentalLists(
  accessToken,
  page = 1,
  pageSize = 10,
  search = "",
  customer_type = "",
  status = "",
) {
  const params = new URLSearchParams({
    page,
    page_size: pageSize,
  });

  if (search) {
    params.append("search", search);
  }
  if (customer_type && customer_type !== "all")
    params.append("customer_type", customer_type);
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
