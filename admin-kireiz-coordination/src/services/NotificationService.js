import ApiService from './ApiService'

export async function apiGetNotificationList(accessToken) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/notifications/get-list/`,
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}
