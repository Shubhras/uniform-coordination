import ApiService from "./ApiService";

export async function apiCategoryById(id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/subcategory/list/?categoryId=${id}`,
    method: "get",
  });
}
