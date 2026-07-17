import ApiService from "./ApiService";

export async function apiGetMenuList(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/menu/list/",
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetRolePermissionList(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/role-permissions/list/",
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetRoleList(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/roles/list/",
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiUpdatePermissionList(accessToken, payload) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/role-permissions/update/",
    method: "post",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
