import ApiService from "./ApiService";

export async function apiGetB2BAccountList(
  accessToken,
  page = 1,
  pageSize = 10,
  search = "",
  isActive = "",
) {
  const params = new URLSearchParams();

  if (search) params.append("search", search);
  if (isActive !== "") params.append("isActive", isActive);

  params.append("page", page);
  params.append("page_size", pageSize);

  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/admin-user/get-list/?${params.toString()}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}


export async function apiCreateB2BAccount(accessToken, payload) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/admin-user/create/`,
    method: "post",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiUpdateB2BAccount(accessToken, id, payload) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/admin-user/${id}/update/`,
    method: "put",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiDeleteB2BAccount(accessToken, id) {
  const params = new URLSearchParams({
    id: id,
  });

  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/admin-user/delete/?${params.toString()}`,
    method: "delete",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetQUotationList(
  accessToken,
  page = 1,
  pageSize = 10,
  search = "",
  status = "",
) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/quotationrequest/get/?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiQuotationDetails(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/quotation-request/${id}/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiUpdateQuotation(accessToken, id, payload) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/quotation-request/${id}/update/`,
    method: "put",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetCustomersList(
  accessToken,
  page = 1,
  pageSize = 10,
  search = "",
  userType = "",
  isActive = "",
  isVerify = "",
) {
  const params = new URLSearchParams();

  if (search) params.append("search", search);
  if (userType) params.append("userType", userType);
  if (isActive !== "") params.append("isActive", isActive);
  // if (isVerify !== "") params.append("is_verify", isVerify);

  params.append("page", page);
  params.append("page_size", pageSize);

  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/customers/list/?${params.toString()}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetCustomersDetails(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/customers/${id}/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiUpdateCustomer(accessToken, id, payload) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/customers/${id}/update/`,
    method: "put",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
}
