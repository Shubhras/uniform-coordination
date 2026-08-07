import ApiService from "./ApiService";

const authHeader = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
});

export async function apiGetSimulationConfig(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/simulation-config/",
    method: "get",
    headers: authHeader(accessToken),
  });
}

// Accepts any subset of:
//   selected_template_id, output_format, compression_quality, dpi
export async function apiSaveSimulationConfig(accessToken, data) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/simulation-config/",
    method: "post",
    data,
    headers: authHeader(accessToken),
  });
}
