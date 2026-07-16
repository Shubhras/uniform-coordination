import ApiService from "./ApiService";

export async function apiGetSettingsProfile(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/profile/",
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiUpdateSettingsProfile(accessToken, payload) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/update-profile/",
    method: "put",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetSettingsNotification() {
  return ApiService.fetchDataWithAxios({
    url: "/setting/notification",
    method: "get",
  });
}

export async function apiGetSettingsBilling() {
  return ApiService.fetchDataWithAxios({
    url: "/setting/billing",
    method: "get",
  });
}

export async function apiGetSettingsIntergration() {
  return ApiService.fetchDataWithAxios({
    url: "/setting/intergration",
    method: "get",
  });
}
