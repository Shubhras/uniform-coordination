import ApiService from "./ApiService";

export async function apiCategoryById(id, filterId = "", sortId = "") {
  let url = `/v1/uniformAdmin/subcategory/list/?categoryId=${id}&search=${filterId}&sortBy=${sortId}`;

  return ApiService.fetchDataWithAxios({
    url,
    method: "get",
  });
}

export async function apiGetTemplateByCategory(categoryId, search = "") {
  let url = `/v1/uniformAdmin/templates/list/?category_id=${categoryId}&search=${search}`;

  return ApiService.fetchDataWithAxios({
    url,
    method: "get",
  });
}

