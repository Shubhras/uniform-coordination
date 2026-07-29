import ApiService from "./ApiService";

export async function apiOrderPayment(token, data) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/userhub/payments/create-intent/",
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: data,
  });
}
export async function apiPaymentDetail(token, paymentId) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/payments/detail/${paymentId}/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },

  });
}