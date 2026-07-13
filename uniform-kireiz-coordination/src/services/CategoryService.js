import ApiService from "./ApiService";

export async function apiCategoryById(id, filterId = "", sortId = "") {
  let url = `/v1/uniformAdmin/subcategory/list/?categoryId=${id}`;
  
  if (filterId && filterId !== "all") {
    url += `&activeFilter=${filterId}`;
  }
  
  if (sortId && sortId !== "popular") {
    url += `&sortBy=${sortId}`;
  }

  return ApiService.fetchDataWithAxios({
    url,
    method: "get",
  });
}



