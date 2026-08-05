import ApiService from "./ApiService";

const authHeader = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
});

export async function apiGetSalesReps(accessToken, search = "") {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const qs = params.toString();

  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/sales-reps/${qs ? `?${qs}` : ""}`,
    method: "get",
    headers: authHeader(accessToken),
  });
}

export async function apiCreateSalesRep(accessToken, data) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/sales-reps/",
    method: "post",
    data,
    headers: authHeader(accessToken),
  });
}

export async function apiGetSalesRepProfile(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/sales-reps/${id}/`,
    method: "get",
    headers: authHeader(accessToken),
  });
}

export async function apiGetAssignmentBoard(accessToken, search = "") {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const qs = params.toString();

  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/sales-reps/assignments/${qs ? `?${qs}` : ""}`,
    method: "get",
    headers: authHeader(accessToken),
  });
}

// sales_rep_id null unassigns the account.
export async function apiAssignAccount(accessToken, accountId, salesRepId) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/sales-reps/assignments/",
    method: "post",
    data: { account_id: accountId, sales_rep_id: salesRepId },
    headers: authHeader(accessToken),
  });
}
