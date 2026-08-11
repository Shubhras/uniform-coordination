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

export async function apiExportReportAnalytics(accessToken, type, startDate = "", endDate = "") {
  let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/space/uniformAdmin/reports-analytics/export/?type=${type}`;
  if (startDate && endDate) {
    url += `&start_date=${startDate}&end_date=${endDate}`;
  }
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to export report");
  }
  return response.blob();
}
