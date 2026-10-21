import ApiService from "./ApiService";

export async function apiSendEmail(accessToken, payload) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/send-email/",
    method: "post",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
