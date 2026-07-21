import ApiService from './ApiService'

export async function apiGetHomeData(params = {}) {

    return ApiService.fetchDataWithAxios({
        url: '/v1/space/uniformAdmin/uniform-home/?type=table',
        method: 'get',
        params,
    })
}