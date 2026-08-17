import ApiService from "./ApiService";

export async function apiGetAdminPayments(accessToken, { page = 1, pageSize = 10, search = "", status = "" } = {}) {
  let url = `/v1/space/userhub/admin/payments/list/?page=${page}&page_size=${pageSize}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status) url += `&status=${encodeURIComponent(status)}`;

  return ApiService.fetchDataWithAxios({
    url,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetAdminPaymentDetails(accessToken, paymentId) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/admin/payments/detail/${paymentId}/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetAdminRefunds(accessToken, { page = 1, pageSize = 10, search = "", status = "" } = {}) {
  let url = `/v1/space/uniformAdmin/refund/list/?page=${page}&page_size=${pageSize}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status) url += `&status=${encodeURIComponent(status)}`;

  return ApiService.fetchDataWithAxios({
    url,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiProcessRefund(accessToken, refundId, payload) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/refund/${refundId}/`,
    method: "patch",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetPromocodes(accessToken, { page = 1, pageSize = 10, search = "", status = "", type = "" } = {}) {
  let url = `/v1/space/uniformAdmin/promocode/list/?page=${page}&page_size=${pageSize}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status) url += `&status=${encodeURIComponent(status)}`;
  if (type) url += `&type=${encodeURIComponent(type)}`;

  return ApiService.fetchDataWithAxios({
    url,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiCreatePromocode(accessToken, payload) {
  const isFormData = payload instanceof FormData;
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/promocode/create/`,
    method: "post",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
    },
  });
}

export async function apiUpdatePromocode(accessToken, id, payload) {
  const isFormData = payload instanceof FormData;
  return ApiService.fetch.fetchDataWithAxios ? ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/promocode/update/${id}/`,
    method: "put",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
    },
  }) : ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/promocode/update/${id}/`,
    method: "put",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
    },
  });
}

export async function apiDeletePromocode(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/promocode/delete/${id}/`,
    method: "delete",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetPaymentPdf(accessToken, paymentId) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/payment/${paymentId}/pdf/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
