import ApiService from "./ApiService";


export async function apiModelInfoCreate(data, token) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/modelinfo/create/",
    method: "post",
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}


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
export async function apiUpadteDesign(id, data, token) {

  console.log("apiUpadteDesign", id, data);
  return ApiService.fetchDataWithAxios({
    url: `/v1/userhub/customupdatemodels/${id}/update/`,
    method: "put",
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


export async function apiGetModalInfo(id, token) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/userhub/customupdatemodels/${id}/get/`,
    responseType: "json",
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
