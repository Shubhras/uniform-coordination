import ApiService from "./ApiService";

const authHeader = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
});

export async function apiGetSimulationAssets(
  accessToken,
  { search = "", onlyWithImage = false } = {},
) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (onlyWithImage) params.set("only_with_image", "true");
  const qs = params.toString();

  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/simulation-assets/${qs ? `?${qs}` : ""}`,
    method: "get",
    headers: authHeader(accessToken),
  });
}

// data: { z_index?, offset_x?, offset_y? }
export async function apiUpdateSimulationAsset(accessToken, id, data) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/simulation-assets/${id}/update/`,
    method: "post",
    data,
    headers: authHeader(accessToken),
  });
}

// Deliberately the same public endpoint the customer site calls, so the admin
// preview shows exactly what a shopper receives. If the two ever diverge, the
// Preview Simulation tab surfaces it instead of hiding it.
export async function apiGetSimulationOptions(accessToken, categoryId = "") {
  const params = new URLSearchParams();
  if (categoryId) params.set("category_id", String(categoryId));
  const qs = params.toString();

  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/simulation/options/${qs ? `?${qs}` : ""}`,
    method: "get",
    headers: authHeader(accessToken),
  });
}

// Ordered layer stack for one product — the same endpoint the customer site uses.
// Answers 404 when the admin has hidden the product from the simulation.
export async function apiGetSimulationProductLayers(accessToken, productId) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/simulation/product/${productId}/layers/`,
    method: "get",
    headers: authHeader(accessToken),
  });
}

// Attribute structure per category — which attributes the customer simulation
// shows, and in what order. GET is public; saving needs the admin token.
export async function apiGetSimulationStructure(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/simulation-assets/structure/",
    method: "get",
    headers: authHeader(accessToken),
  });
}

export async function apiSaveSimulationStructure(
  accessToken,
  categoryName,
  attributes,
) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/simulation-assets/structure/",
    method: "post",
    data: { categoryName, attributes },
    headers: authHeader(accessToken),
  });
}

// Which products the admin has enabled for the customer simulation.
export async function apiGetProductVisibility(
  accessToken,
  { page = 1, pageSize = 10, search = "", categoryId = "" } = {},
) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (search) params.set("search", search);
  if (categoryId) params.set("category_id", String(categoryId));

  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/simulation-assets/product-visibility/?${params.toString()}`,
    method: "get",
    headers: authHeader(accessToken),
  });
}

export async function apiToggleProductVisibility(accessToken, productId, show) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/simulation-assets/product-visibility/",
    method: "post",
    data: { product_id: productId, show_in_simulation: show },
    headers: authHeader(accessToken),
  });
}

// order: full list of layer ids, bottom-most first
export async function apiReorderSimulationAssets(accessToken, order) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/simulation-assets/reorder/",
    method: "post",
    data: { order },
    headers: authHeader(accessToken),
  });
}
