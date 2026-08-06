import ApiService from "./ApiService";

export async function apiInspectionQueueList(
  accessToken,
  page = 1,
  pageSize = 10,
  search = "",
) {
  const params = new URLSearchParams({
    page,
    page_size: pageSize,
  });

  if (search) {
    params.append("search", search);
  }

  if (status) {
    params.append("result", status.toLowerCase());
  }

  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/inventory/inspection-queue/?${params.toString()}`,
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
