import ApiService from "./ApiService";
import AxiosBase from "./axios/AxiosBase";

export async function apiGetUnitPriceList(page = 1, pageSize = 10) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/unit-price/list/?page=${page}&page_size=${pageSize}`,
    method: "get",
    // headers: {
    //     Authorization: `Bearer ${accessToken}`,
    // },
  });
}

export async function apiExportUnitPrice(type = "csv") {
  const response = await AxiosBase({
    url: `/v1/uniformAdmin/unit-price/export/?type=${type}`,
    method: "get",
    responseType: "blob",
    // headers: {
    //     Authorization: `Bearer ${accessToken}`,
    // },
  });
  return response;
}
