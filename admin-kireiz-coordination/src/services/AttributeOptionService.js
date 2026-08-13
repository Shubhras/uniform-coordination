import ApiService from "./ApiService";

/*
 * The choices a shopper sees per simulation attribute — collar styles, cuffs, the size
 * run. One endpoint set covers every attribute; `attribute` selects which.
 */

export async function apiGetAttributeOptions(
  accessToken,
  { attribute = "", categoryId = "", search = "", page = 1, pageSize = 100 } = {},
) {
  const params = new URLSearchParams({ page, page_size: pageSize });
  if (attribute) params.append("attribute", attribute);
  if (categoryId) params.append("category_id", categoryId);
  if (search.trim()) params.append("search", search.trim());

  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/attribute-options/list/?${params.toString()}`,
    method: "get",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function apiCreateAttributeOption(accessToken, formData) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/attribute-options/create/",
    method: "post",
    data: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function apiUpdateAttributeOption(accessToken, id, formData) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/attribute-options/${id}/update/`,
    method: "put",
    data: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function apiDeleteAttributeOption(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/attribute-options/${id}/delete/`,
    method: "delete",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
