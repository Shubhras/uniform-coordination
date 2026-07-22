import ApiService from "./ApiService";

export async function apiGetReportAnalytics(accessToken, type) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/reports-analytics/?type=${type}&start_date=2026-01-01&end_date=2026-06-20`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
