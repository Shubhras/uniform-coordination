import ApiService from "./ApiService";

export async function apiGetFabricList(page = 1, pageSize = 10, search = "") {
  const params = new URLSearchParams({
    page,
    page_size: pageSize,
  });

  if (search) {
    params.append("search", search);
  }

  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/fabric/list/?${params.toString()}`,
    method: "get",
  });
}

export async function apiCreateFabric(accessToken, payload) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/fabric/create/",
    method: "post",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiUpdateFabric(accessToken, id, payload) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/fabric/update/${id}/`,
    method: "put",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiFabricCategoryList(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/categories/list/",
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiFabricSubCategoryList(accessToken, categoryId) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/subcategory/list/?categoryId=${categoryId}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiDeleteFabric(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/fabric/delete/${id}/`,
    method: "delete",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
