import ApiService from "./ApiService";

export async function apiGetMenuList(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/menu/list/",
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
