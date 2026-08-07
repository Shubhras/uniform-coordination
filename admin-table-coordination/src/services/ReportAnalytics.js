import ApiService from "./ApiService";

export async function apiGetReportAnalytics(accessToken, type, startDate = "", endDate = "") {
  let url = `/v1/space/uniformAdmin/reports-analytics/?type=${type}`;
  if (startDate && endDate) {
    url += `&start_date=${startDate}&end_date=${endDate}`;
  }
  return ApiService.fetchDataWithAxios({
    url,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
