import ApiService from "./ApiService";

const authHeader = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
});

export async function apiGetPdfTemplateList(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/pdf-templates/list/",
    method: "get",
    headers: authHeader(accessToken),
  });
}

export async function apiGetPdfTemplate(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/pdf-templates/${id}/`,
    method: "get",
    headers: authHeader(accessToken),
  });
}

export async function apiCreatePdfTemplate(accessToken, data) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/pdf-templates/create/",
    method: "post",
    data,
    headers: authHeader(accessToken),
  });
}

export async function apiUpdatePdfTemplate(accessToken, id, data) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/pdf-templates/${id}/update/`,
    method: "post",
    data,
    headers: authHeader(accessToken),
  });
}

export async function apiDeletePdfTemplate(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/pdf-templates/${id}/delete/`,
    method: "delete",
    headers: authHeader(accessToken),
  });
}

export async function apiGetActiveQuotationTemplate(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/pdf-templates/active-quotation/",
    method: "get",
    headers: authHeader(accessToken),
  });
}

// Pass { content } to save, or { reset: true } to restore the built-in default.
export async function apiSaveActiveQuotationTemplate(accessToken, data) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/pdf-templates/active-quotation/",
    method: "post",
    data,
    headers: authHeader(accessToken),
  });
}

export async function apiReorderPdfTemplates(accessToken, order) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/pdf-templates/reorder/",
    method: "post",
    data: { order },
    headers: authHeader(accessToken),
  });
}
