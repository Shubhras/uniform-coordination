import ApiService from "./ApiService";

export async function apiGetProductList(
  accessToken,
  page = 1,
  pageSize = 10,
  productType = "table",
  params=""
) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/product/list/?productType=${productType}&page=${page}&page_size=${pageSize}${params}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiDeleteProduct(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/product/delete/${id}/`,
    method: "delete",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiCreateProduct(accessToken, formData) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/product/create/`,
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
    url: `/v1/space/uniformAdmin/product/update/${id}/?productType=${productType}`,
    method: "put",
    data: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function apiGetProductDetails(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/product/get/${id}/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
}
