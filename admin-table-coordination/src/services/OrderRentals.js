import ApiService from "./ApiService";

export async function apiOrderRentalLists(
  accessToken,
  page = 1,
  pageSize = 10,
  search = "",
) {
  const params = new URLSearchParams({
    page,
    page_size: pageSize,
  });

  if (search) {
    params.append("search", search);
  }

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

export async function apiOrderUpdate(accessToken, orderId) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/order/update/${orderId}/`,
    method: "patch",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
