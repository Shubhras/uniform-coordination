import ApiService from "./ApiService";

export async function apiGetColorsList(
  accessToken,
  page = 1,
  pageSize = 10,
  search = "",
) {
  const params = new URLSearchParams({
    page,
    page_size: pageSize,
  });

  if (search.trim()) {
    params.append("search", search);
  }

  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/colors/list/?${params.toString()}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiDeleteColor(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/colors/delete/${id}/`,
    method: "delete",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiCreateColor(accessToken, payload) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/colors/create/`,
    method: "post",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiUpdateColor(accessToken, id, payload) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/colors/update/${id}/`,
    method: "put",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
