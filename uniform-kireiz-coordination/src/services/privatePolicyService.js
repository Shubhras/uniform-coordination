import ApiService from "./ApiService";

export async function apiPrivatePolicy() {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/privacy-policy/list/?type=uniform",
    method: "get",
  });
}