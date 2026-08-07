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

export async function apiProcessInspection(accessToken, pk, data) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/inventory/inspection-queue/${pk}/process/`,
    method: "post",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data,
  });
}

export async function apiUpdateDamagedItem(accessToken, pk, data) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/inventory/damaged-items/${pk}/update/`,
    method: "patch",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data,
  });
}

export async function apiUpdateCleaningItem(accessToken, pk, data) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/inventory/cleaning-items/${pk}/update/`,
    method: "patch",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data,
  });
}
