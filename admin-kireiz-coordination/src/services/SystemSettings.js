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

// JSON variant for tabs with no file upload. The multipart version below is only
// needed because General Settings carries the logo.
export async function apiUpdateSystemSettings(accessToken, payload) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/settings/system/update/",
    method: "PUT",
    data: payload,
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
