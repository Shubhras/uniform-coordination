import ApiService from "./ApiService";

/**
 * Fetches user shopping cart items list.
 * 
 * @param {string} token - User authentication Bearer token.
 * @param {Object} [params={}] - Optional query parameters.
 * @returns {Promise<Object>} API response with list of cart items.
 */
export async function apiGetCartList(token, params = {}) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/cart/list/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
}

/**
 * Fetches user cart subtotal, tax, and item count summary breakdown.
 * 
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response with cart financial summary.
 */
export async function apiGetCartSummary(token) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/cart/item-summary/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Adds a uniform or theme product item to the user shopping cart.
 * 
 * @param {string} token - User authentication Bearer token.
 * @param {string|number} product_id - Target product ID.
 * @param {number} [quantity=1] - Quantity of items to add.
 * @returns {Promise<Object>} API response confirming item addition to cart.
 */
export async function apiAddToCart(token, product_id, quantity = 1) {
  const payload = {
    product_id: product_id,
    quantity: quantity,
  };
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/cart/add/`,
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: payload,
  });
}

/**
 * Updates item quantity for a specific cart line item.
 * 
 * @param {string} token - User authentication Bearer token.
 * @param {string|number} itemId - Target cart item ID.
 * @param {number} count - Updated item quantity.
 * @returns {Promise<Object>} API response confirming cart item update.
 */
export async function apiUpdateItemQuantity(token, itemId, count) {
  const payload = {
    quantity: count,
  };
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/cart/item/${itemId}/update/`,
    method: "patch",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: payload,
  });
}

/**
 * Deletes an item from the shopping cart.
 * 
 * @param {string} token - User authentication Bearer token.
 * @param {string|number} itemId - Target cart item ID to remove.
 * @returns {Promise<Object>} API response confirming cart item deletion.
 */
export async function apiDeleteItem(token, itemId) {
  const payload = {
    item_id: itemId,
  };
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/cart/item/${itemId}/delete/`,
    method: "delete",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: payload,
  });
}

