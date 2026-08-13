import ApiService from "./ApiService";

// Helper generator for CRUD endpoints
function createAttributeService(endpointSlug) {
  return {
    list: async (accessToken, page = 1, pageSize = 10, search = "") => {
      const params = new URLSearchParams({
        page,
        page_size: pageSize,
      });
      if (search?.trim()) {
        params.append("search", search.trim());
      }
      return ApiService.fetchDataWithAxios({
        url: `/v1/space/uniformAdmin/${endpointSlug}/list/?${params.toString()}`,
        method: "get",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    create: async (accessToken, payload) => {
      let data = payload;
      let headers = { Authorization: `Bearer ${accessToken}` };
      if (payload instanceof FormData) {
        data = payload;
      }
      return ApiService.fetchDataWithAxios({
        url: `/v1/space/uniformAdmin/${endpointSlug}/create/`,
        method: "post",
        data,
        headers,
      });
    },
    update: async (accessToken, id, payload) => {
      let data = payload;
      let headers = { Authorization: `Bearer ${accessToken}` };
      return ApiService.fetchDataWithAxios({
        url: `/v1/space/uniformAdmin/${endpointSlug}/update/${id}/`,
        method: "put",
        data,
        headers,
      });
    },
    delete: async (accessToken, id) => {
      return ApiService.fetchDataWithAxios({
        url: `/v1/space/uniformAdmin/${endpointSlug}/delete/${id}/`,
        method: "delete",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
  };
}

export const TableShapesService = createAttributeService("table-shapes");
export const ClosuresService = createAttributeService("closures");
export const StylesService = createAttributeService("styles");
export const SizesService = createAttributeService("sizes");
export const PatternsService = createAttributeService("patterns");
