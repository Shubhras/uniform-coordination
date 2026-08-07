import ApiService from "./ApiService";

export async function apiGetContractsList(accessToken, page = 1, pageSize = 10, search = "", status = "") {
  const params = new URLSearchParams({
    page,
    page_size: pageSize,
  });

  if (search) {
    params.append("search", search);
  }

  if (status && status !== "all") {
    params.append("status", status.toLowerCase());
  }

  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/contracts/get/?${params.toString()}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiGetContractDetail(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/contracts/${id}/get/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
