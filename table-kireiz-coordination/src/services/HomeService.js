import ApiService from './ApiService'

export async function apiGetHomeData(params = {}) {

    return ApiService.fetchDataWithAxios({
        url: '/v1/space/uniformAdmin/uniform-home/?type=table',
        method: 'get',
        params,
    })
}
export async function apiGetBrowseByThemeData(params = {}) {

    return ApiService.fetchDataWithAxios({
        url: '/v1/space/uniformAdmin/tabletheme/get-list/',
        method: 'get',
        params,
    })
}
export async function apiGetSindleThemeDetails(themeId, params = {}) {

    return ApiService.fetchDataWithAxios({
        url: `/v1/space/uniformAdmin/tabletheme/${themeId}/get/`,
        method: 'get',
        params,
    })
}