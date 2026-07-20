import ApiService from './ApiService'

export async function apiGetDashboard(accessToken) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/space/uniformAdmin/admindesh/',
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}
