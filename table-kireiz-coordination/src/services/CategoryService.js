import ApiService from "./ApiService";

export async function apiGetCategories(params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/space/uniformAdmin/categories/list/',
        method: 'get',
        params,
    });
}

export async function apiGetMaterialList(params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/space/uniformAdmin/fabric/list/',
        method: 'get',
        params,
    });
}

export async function apiGetColorList(params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/space/uniformAdmin/colors/list/',
        method: 'get',
        params,
    });
}
