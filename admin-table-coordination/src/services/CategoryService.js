import ApiService from "./ApiService";

export async function apiGetCategoryList(
  accessToken,
  page = 1,
  pageSize = 10,
  search = "",
) {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  if (search.trim()) {
    params.append("search", search.trim());
  }

  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/categories/list/?${params.toString()}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetSubcategoryList(accessToken, categoryId) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/subcategory/list/?categoryId=${categoryId}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiDeleteCategory(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/categories/delete/${id}/`,
    method: "delete",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiCreateCategory(accessToken, formData) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/categories/create/`,
    method: "post",
    data: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function apiUpdateCategory(accessToken, id, formData) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/categories/update/${id}/`,
    method: "put",
    data: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function apiReorderCategory(accessToken, categoryId, newPosition) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/categories/reorder/`,
    method: "put",
    data: {
      category_id: categoryId,
      new_position: newPosition,
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
