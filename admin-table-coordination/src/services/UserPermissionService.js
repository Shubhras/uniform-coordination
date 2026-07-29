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
