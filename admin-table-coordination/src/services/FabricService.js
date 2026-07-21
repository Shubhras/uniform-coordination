import ApiService from "./ApiService";

export async function apiGetFabricList(accessToken, page = 1, pageSize = 10) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/fabric/list/?page=${page}&page_size=${pageSize}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiCreateFabric(accessToken, payload) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/uniformAdmin/fabric/create/",
    method: "post",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiUpdateFabric(accessToken, id, payload) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/fabric/update/${id}/`,
    method: "put",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiFabricCategoryList(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/uniformAdmin/categories/list/",
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiFabricSubCategoryList(accessToken, categoryId) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/subcategory/list/?categoryId=${categoryId}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiDeleteFabric(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/fabric/delete/${id}/`,
    method: "delete",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
