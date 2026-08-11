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

// order: full list of layer ids, bottom-most first
export async function apiReorderSimulationAssets(accessToken, order) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/simulation-assets/reorder/",
    method: "post",
    data: { order },
    headers: authHeader(accessToken),
  });
}
