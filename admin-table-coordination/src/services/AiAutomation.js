import ApiService from "./ApiService";

export async function apiFaqAssistant(accessToken, payload) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/uniformAdmin/ai/faq-assistant/",
    method: "post",
    data: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiOrderDeliveryList(accessToken, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/ai/order-lookup/?query=${id}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiProductSearch(accessToken, query) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/uniformAdmin/ai/product-search/",
    method: "post",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      query,
    },
  });
}

export async function apiDraftGenerator(accessToken, inquiry) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/uniformAdmin/ai/draft-generator/",
    method: "post",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      inquiry,
    },
  });
}