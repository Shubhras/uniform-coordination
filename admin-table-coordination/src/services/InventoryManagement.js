import ApiService from "./ApiService";

export async function apiInspectionQueueList(
  accessToken,
  page = 1,
  pageSize = 10,
) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/inventory/inspection-queue/?page=${page}&page_size=${pageSize}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiDamagedItemsList(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/inventory/damaged-items/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiCleaningItems(accessToken) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/inventory/cleaning-items/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
