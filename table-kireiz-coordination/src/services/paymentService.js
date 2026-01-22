import ApiService from "./ApiService";

export async function apiOrderPayment(token, data) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/payments/create-intent/",
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: data,
  });
}
