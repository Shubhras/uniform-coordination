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

export async function apiGetThemeList(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/tabletheme/get-list/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
