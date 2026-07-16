import ApiService from "./ApiService";

export async function apiGetProductList(
  accessToken,
  {
  page = 1,
  pageSize = 10,
  productType = "uniform",
  categoryId = "",
  subcategoryId = "",
  type = "",
  ordering = "",
  search = "",
  }={}
) {
  const params = new URLSearchParams({
    page,
    page_size: pageSize,
    productType: productType,
  });
  if (categoryId) {
    params.append("category_id", categoryId);
  }

  if (subcategoryId) {
    params.append("subcategory_id", subcategoryId);
  }

  if (type) {
    params.append("type", type);
  }

  if (ordering) {
    params.append("ordering", ordering);
  }

  if (search) {
    params.append("search", search);
  }

  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/product/list/?${params.toString()}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiDeleteProduct(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/product/delete/${id}/`,
    method: "delete",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiCreateProduct(accessToken, formData) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/product/create/`,
    method: "post",
    data: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function apiUpdateProduct(
  accessToken,
  id,
  formData,
  productType = "uniform",
) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/product/update/${id}/?productType=${productType}`,
    method: "put",
    data: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
}
