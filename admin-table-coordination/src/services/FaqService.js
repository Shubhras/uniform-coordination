import ApiService from './ApiService'

export async function apiGetFaqList(accessToken, page = 1, pageSize = 10) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/space/uniformAdmin/faqs/list/?page=${page}&page_size=${pageSize}`,
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export async function apiDeleteFaq(accessToken, id) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/space/uniformAdmin/faqs/delete/${id}/`,
        method: 'delete',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export async function apiCreateFaq(accessToken, payload) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/space/uniformAdmin/faqs/create/`,
        method: 'post',
        data: payload,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export async function apiUpdateFaq(accessToken, id, payload) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/space/uniformAdmin/faqs/update/${id}/`,
        method: 'put',
        data: payload,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}
