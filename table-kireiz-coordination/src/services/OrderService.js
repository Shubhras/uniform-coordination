import ApiService from "./ApiService";

/**
 * Creates a new order with delivery details and rental period.
 *
 * @param {string} token - User authentication Bearer token.
 * @param {Object} data - Order creation payload containing customer info, delivery address, and rental dates.
 * @returns {Promise<Object>} API response with created order ID.
 */
export async function apiCreateOrder(token, data) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/userhub/create/order/",
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: data,
  });
}

/**
 * Validates and applies promo code discount to order.
 *
 * @param {string} token - User authentication Bearer token.
 * @param {Object} data - Promocode payload containing code.
 * @returns {Promise<Object>} API response with discount details.
 */
// export async function apiApplyPromocode(token, data) {
//   return ApiService.fetchDataWithAxios({
//     url: "/v1/space/uniformAdmin/promocode/list/",
//     method: "get",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     data: data,
//   });
// }

export async function apiApplyPromocode(token, data) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/uniformAdmin/validate-promocode/",
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data,
  });
}

/**
 * Fetches order overview details by order ID payload.
 *
 * @param {string} token - User authentication Bearer token.
 * @param {Object} data - Payload containing order_id.
 * @returns {Promise<Object>} API response with order overview.
 */
export async function apiOverviewData(token, data) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/userhub/order/id/",
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: data,
  });
}

/**
 * Fetches order summary calculation breakdown.
 *
 * @param {string} token - User authentication Bearer token.
 * @param {Object} data - Payload containing order_id.
 * @returns {Promise<Object>} API response with subtotal, tax, shipping, and total amount.
 */
export async function apiGetOverviewSummary(token, data) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/order/summary/`,
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: data,
  });
}

/**
 * Fetches authenticated user order history list.
 *
 * @param {string} token - User authentication Bearer token.
 * @param {Object} [params] - Optional pagination or filter query parameters.
 * @returns {Promise<Object>} API response with user order list.
 */
export async function apiUserOrderList(token, params) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/userhub/user/order/list/",
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: params,
  });
}

/**
 * Fetches detailed order information for a single order ID.
 *
 * @param {string} token - User authentication Bearer token.
 * @param {string|number} id - Target order ID.
 * @returns {Promise<Object>} API response with full order details.
 */
export async function apiSindleOrderDetials(token, id) {
  const data = { order_id: id };
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/order/${id}/get/`,
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: data,
  });
}

/**
 * Fetches existing customer details for form auto-filling.
 *
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response with customer details.
 */
export async function apiGetCustomerDetails(token) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/userhub/customer/details/",
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
