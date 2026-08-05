import ApiService from "./ApiService";

export async function apiGetPartsList(
  accessToken,
  page = 1,
  pageSize = 10,
  search = "",
  categoryId = "",
  subcategoryId = "",
  partId = "",
) {
  const params = new URLSearchParams({
    page,
    page_size: pageSize,
  });

  if (search) {
    params.append("search", search);
  }

  if (categoryId) {
    params.append("category_id", categoryId);
  }

  if (subcategoryId) {
    params.append("subcategory_id", subcategoryId);
  }

  if (partId) {
    params.append("part_id", partId);
  }

  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/parts/list/?${params.toString()}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiDeletePart(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/parts/delete/${id}/`,
    method: "delete",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiCreatePart(accessToken, formData) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/parts/create/`,
    method: "post",
    data: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function apiUpdatePart(accessToken, id, formData) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/parts/update/${id}/`,
    method: "put",
    data: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function apiCreateDuplicateParts(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/parts/${id}/duplicate/`,
    method: "post",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
