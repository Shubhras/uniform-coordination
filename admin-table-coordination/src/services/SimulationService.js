import ApiService from "./ApiService";

export async function apiGetSimulationStructure(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/simulation/structure/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiSaveSimulationStructure(accessToken, categoryName, attributes) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/simulation/structure/save/`,
    method: "post",
    data: {
      categoryName,
      attributes,
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiToggleProductVisibility(accessToken, productId, showInSimulation) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/product/toggle-simulation/`,
    method: "post",
    data: {
      product_id: productId,
      show_in_simulation: showInSimulation,
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetSimulationOptions(accessToken, categoryName, tableShape) {
  const params = new URLSearchParams();
  if (categoryName) params.append("category_name", categoryName);
  if (tableShape) params.append("table_shape", tableShape);

  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/simulation/options/?${params.toString()}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetSavedSimulations(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/simulations/saved/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

