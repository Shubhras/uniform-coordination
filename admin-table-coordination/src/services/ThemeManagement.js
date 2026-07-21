import ApiService from "./ApiService";

export async function apiCreateTheme(accessToken, formData) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/tabletheme/create/`,
    method: "post",
    data: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function apiGetThemeList(
  accessToken,
  {
    search = "",
    categoryId = "",
    ordering = "newest",
    page = 1,
    pageSize = 10,
  } = {},
) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/tabletheme/get-list/?search=${search}&category_id=${categoryId}&ordering=${ordering}&page=${page}&page_size=${pageSize}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetThemeDetails(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/tabletheme/${id}/get/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiDeleteTheme(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/tabletheme/delete/${id}/`,
    method: "delete",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiUpdateTheme(accessToken, id, formData) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/tabletheme/${id}/update/`,
    method: "put",
    data: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
}
