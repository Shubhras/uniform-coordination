import ApiService from './ApiService'

export async function apiGetHomeData(params = {}) {
  
    return ApiService.fetchDataWithAxios({
        url: '/v1/uniformAdmin/uniform-home/?type=table',
        // url: '/v1/uniformAdmin/uniform-home/',
        method: 'get',
        params,
    })
}