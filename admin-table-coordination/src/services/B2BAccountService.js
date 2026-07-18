import ApiService from './ApiService'

export async function apiGetB2BAccountList(accessToken, page = 1, pageSize = 100) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/admin-user/get-list/?page=${page}&page_size=${pageSize}`,
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export async function apiCreateB2BAccount(accessToken, payload) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/admin-user/create/`,
        method: 'post',
        data: payload,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export async function apiUpdateB2BAccount(accessToken, id, payload) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/admin-user/${id}/update/`,
        method: 'put',
        data: payload,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export async function apiDeleteB2BAccount(accessToken, id) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/admin-user/delete/${id}/`,
        method: 'delete',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}
