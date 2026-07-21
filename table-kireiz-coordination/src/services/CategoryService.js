import ApiService from "./ApiService";

export async function apiGetCategories(params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/space/uniformAdmin/categories/list/',
        method: 'get',
        params,
    });
}
