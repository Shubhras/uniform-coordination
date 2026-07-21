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
