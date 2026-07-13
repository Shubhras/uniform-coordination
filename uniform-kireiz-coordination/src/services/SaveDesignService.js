import ApiService from "./ApiService";

export async function apiSaveDesign(data, token) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/customupdatemodels/create/",
    method: "post",
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function apiExportDesignPdf(id, token) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/userhub/customupdatemodels/${id}/export/`,
    method: "get",
    responseType: "json",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}


export async function apiGetModalInfo(token, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/userhub/customupdatemodels/${id}/get/`,
    responseType: "json",
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
