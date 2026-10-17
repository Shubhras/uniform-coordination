import ApiService from "./ApiService";

export async function apiGetUsersList(
  accessToken,
  page = 1,
  pageSize = 10,
  params = "",
) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/users/?page=${page}&page_size=${pageSize}${params}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetUserDetails(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/users/${id}/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetMenuList(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/uniformAdmin/menu/list/",
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetRolePermissionList(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/uniformAdmin/role-permissions/list/",
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiUpdatePermissionList(accessToken, payload) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/uniformAdmin/role-permissions/update/",
    method: "post",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiUpdateUserStatus(accessToken, id, payload) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/users/${id}/`,
    method: "patch",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiCreateUser(accessToken, payload) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/uniformAdmin/users/",
    method: "post",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetAdminUsersList(
  accessToken,
  page = 1,
  pageSize = 10,
  params = "",
) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/admin-user/get-list/?page=${page}&page_size=${pageSize}${params}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetAdminUserDetails(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/admin-user/${id}/get/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiCreateAdminUser(accessToken, payload) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/uniformAdmin/admin-user/create/",
    method: "post",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiUpdateAdminUser(accessToken, id, payload) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/admin-user/${id}/update/`,
    method: "put",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiDeleteAdminUser(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/admin-user/delete/?id=${id}`,
    method: "delete",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

