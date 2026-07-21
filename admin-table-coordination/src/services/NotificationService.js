import ApiService from './ApiService'

export async function apiGetNotificationList(accessToken) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/space/uniformAdmin/notifications/get-list/`,
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export async function apiGetNotificationDetails(accessToken, id) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/space/uniformAdmin/admin-notification/${id}/`,
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}
