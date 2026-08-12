import ApiService from "./ApiService";

/**
 * Customer-side reads for the uniform simulation.
 *
 * Everything here is configured by the admin (Admin → Simulation Assets):
 * which products may be simulated, which part images make up each look, and how
 * those layers stack and align. These endpoints are the single source, so the
 * customer simulation always matches what the admin set — no duplicated config.
 *
 * Public endpoints: a shopper is not signed in while browsing, so no token is
 * required. The backend only ever returns admin-enabled records.
 */

/**
 * Categories/industries that have at least one product enabled for simulation.
 *
 * @returns {Promise<Object>} API response with the category list.
 */
export async function apiGetSimulationCategories() {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/simulation/categories/`,
    method: "get",
  });
}

/**
 * Products available to simulate, with their ordered layers, plus the fabric and
 * colour choices that apply.
 *
 * @param {Object} [params] - Optional `category_id` or `category_name` filter.
 * @returns {Promise<Object>} API response with products, fabrics and colors.
 */
export async function apiGetSimulationOptions(params = {}) {
  const query = new URLSearchParams();
  if (params.categoryId) query.set("category_id", String(params.categoryId));
  if (params.categoryName) query.set("category_name", params.categoryName);
  const qs = query.toString();

  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/simulation/options/${qs ? `?${qs}` : ""}`,
    method: "get",
  });
}

/**
 * The ordered layer stack for one product — what a canvas renderer draws.
 *
 * Each layer carries `image`, `z_index` and `offset_x` / `offset_y` exactly as the
 * admin configured them. Draw in array order (already sorted bottom to top) and
 * position each image at its offset.
 *
 * Responds 404 when the admin has disabled the product for simulation, so a hidden
 * product can never be rendered.
 *
 * @param {number|string} productId
 * @returns {Promise<Object>} API response with the layer stack.
 */
export async function apiGetSimulationProductLayers(productId) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/simulation/product/${productId}/layers/`,
    method: "get",
  });
}
