import ApiService from './ApiService'

export async function apiGetFaq(params = {}) {

    return ApiService.fetchDataWithAxios({
        url: '/v1/space/uniformAdmin/faqs/list/?type=table',
        method: 'get',
        params,
    })
}