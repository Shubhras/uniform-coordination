import ApiService from './ApiService'

export async function apiGetDashboard(accessToken) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/uniformAdmin/admindesh/',
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export async function apiMarkDashboardAlertsRead(accessToken) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/uniformAdmin/dashboard/alerts/mark-read/',
        method: 'post',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}
