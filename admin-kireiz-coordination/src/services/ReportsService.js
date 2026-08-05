import ApiService from "./ApiService";

const authHeader = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
});

export async function apiGetReportsAnalytics(accessToken, months = 6) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/reports/analytics/?months=${months}`,
    method: "get",
    headers: authHeader(accessToken),
  });
}

// Returns a CSV blob — the caller triggers the browser download.
// type: quotations (default) | customers | products | sales | fabrics
export async function apiExportReportsCsv(accessToken, type = "quotations") {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/reports/export/?type=${type}`,
    method: "get",
    responseType: "blob",
    headers: authHeader(accessToken),
  });
}
