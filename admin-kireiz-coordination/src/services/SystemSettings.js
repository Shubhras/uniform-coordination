import ApiService from "./ApiService";

export async function apiGeneralSettingList(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/settings/system/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiUpdateGeneralSetting(accessToken, payload) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/settings/system/update/",
    method: "PUT",
    data: payload,
    accessToken,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
}
