import ApiService from "./ApiService";

/**
 * Fetches subcategory list by category ID with search filter and sorting.
 *
 * @param {string|number} id - Category ID.
 * @param {string} [filterId=""] - Optional search query string.
 * @param {string} [sortId=""] - Optional sorting parameter.
 * @returns {Promise<Object>} API response with subcategory list.
 */
export async function apiCategoryById(id, filterId = "", sortId = "") {
  let url = `/v1/uniformAdmin/subcategory/list/?categoryId=${id}&search=${filterId}&sortBy=${sortId}`;

  return ApiService.fetchDataWithAxios({
    url,
    method: "get",
  });
}

/**
 * Fetches templates list by category ID with optional search term.
 *
 * @param {string|number} categoryId - Category ID.
 * @param {string} [search=""] - Optional search query string.
 * @returns {Promise<Object>} API response with template list.
 */
export async function apiGetTemplateByCategory(categoryId, search = "") {
  let url = `/v1/uniformAdmin/templates/list/?category_id=${categoryId}&search=${search}`;

  return ApiService.fetchDataWithAxios({
    url,
    method: "get",
  });
}

