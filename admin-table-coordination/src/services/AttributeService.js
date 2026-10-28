import ApiService from "./ApiService";

// Helper generator for CRUD endpoints
function createAttributeService(endpointSlug) {
  return {
    list: async (
      accessToken,
      page = 1,
      pageSize = 10,
      search = "",
      categoryId = null,
    ) => {
      const params = new URLSearchParams();

      if (categoryId) {
        params.append("category_id", categoryId);
      }

      params.append("page", page);
      params.append("page_size", pageSize);

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

// Helper for resolving attribute image URLs
export const getImageUrl = (path) => {
  if (!path) return "";
  let clean = path;
  if (clean.includes("table-admin.dxtspace.com")) {
    clean = clean.replace(/https?:\/\/table-admin\.dxtspace\.com/, "");
  }
  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("blob:")
  ) {
    return clean;
  }
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "")
    .replace(/\/api\/v1\/?$/, "")
    .replace(/\/$/, "");
  const cleanPath = clean.startsWith("/") ? clean : `/${clean}`;
  return `${apiBase}${cleanPath}`;
};

// Table Shapes API
export async function apiGetTableShapesList(accessToken, page = 1, pageSize = 10, search = "", categoryId = null) {
  return TableShapesService.list(accessToken, page, pageSize, search, categoryId);
}
export async function apiCreateTableShape(accessToken, payload) {
  return TableShapesService.create(accessToken, payload);
}
export async function apiUpdateTableShape(accessToken, id, payload) {
  return TableShapesService.update(accessToken, id, payload);
}
export async function apiDeleteTableShape(accessToken, id) {
  return TableShapesService.delete(accessToken, id);
}

// Closures API
export async function apiGetClosuresList(accessToken, page = 1, pageSize = 10, search = "", categoryId = null) {
  return ClosuresService.list(accessToken, page, pageSize, search, categoryId);
}
export async function apiCreateClosure(accessToken, payload) {
  return ClosuresService.create(accessToken, payload);
}
export async function apiUpdateClosure(accessToken, id, payload) {
  return ClosuresService.update(accessToken, id, payload);
}
export async function apiDeleteClosure(accessToken, id) {
  return ClosuresService.delete(accessToken, id);
}

// Styles API
export async function apiGetStylesList(accessToken, page = 1, pageSize = 10, search = "", categoryId = null) {
  return StylesService.list(accessToken, page, pageSize, search, categoryId);
}
export async function apiCreateStyle(accessToken, payload) {
  return StylesService.create(accessToken, payload);
}
export async function apiUpdateStyle(accessToken, id, payload) {
  return StylesService.update(accessToken, id, payload);
}
export async function apiDeleteStyle(accessToken, id) {
  return StylesService.delete(accessToken, id);
}

// Sizes API
export async function apiGetSizesList(accessToken, page = 1, pageSize = 10, search = "", categoryId = null) {
  return SizesService.list(accessToken, page, pageSize, search, categoryId);
}
export async function apiCreateSize(accessToken, payload) {
  return SizesService.create(accessToken, payload);
}
export async function apiUpdateSize(accessToken, id, payload) {
  return SizesService.update(accessToken, id, payload);
}
export async function apiDeleteSize(accessToken, id) {
  return SizesService.delete(accessToken, id);
}

// Patterns API
export async function apiGetPatternsList(accessToken, page = 1, pageSize = 10, search = "", categoryId = null) {
  return PatternsService.list(accessToken, page, pageSize, search, categoryId);
}
export async function apiCreatePattern(accessToken, payload) {
  return PatternsService.create(accessToken, payload);
}
export async function apiUpdatePattern(accessToken, id, payload) {
  return PatternsService.update(accessToken, id, payload);
}
export async function apiDeletePattern(accessToken, id) {
  return PatternsService.delete(accessToken, id);
}
