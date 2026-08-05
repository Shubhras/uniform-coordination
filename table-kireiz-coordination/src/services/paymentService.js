import ApiService from "./ApiService";

/**
 * Creates payment intent and processes transaction via Stripe or PayPal.
 * 
 * @param {string} token - User authentication Bearer token.
 * @param {Object} data - Payment intent payload containing order_id and payment_method.
 * @returns {Promise<Object>} API response with payment intent status and payment_id.
 */
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

/**
 * Fetches transaction details and confirmed receipt for a payment ID.
 * 
 * @param {string} token - User authentication Bearer token.
 * @param {string|number} paymentId - Target payment ID.
 * @returns {Promise<Object>} API response with payment receipt and order details.
 */
export async function apiPaymentDetail(token, paymentId) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/payments/detail/${paymentId}/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}