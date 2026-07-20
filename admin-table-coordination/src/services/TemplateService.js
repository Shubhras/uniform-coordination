import ApiService from './ApiService'

export async function apiGetTemplatesList(accessToken, page = 1, pageSize = 10) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/space/uniformAdmin/templates/list/?page=${page}&page_size=${pageSize}`,
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export async function apiDeleteTemplate(accessToken, id) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/space/uniformAdmin/templates/delete/${id}/`,
        method: 'delete',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export async function apiCreateTemplate(accessToken, formData) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/space/uniformAdmin/templates/create/`,
        method: 'post',
        data: formData,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
        },
    })
}

export async function apiUpdateTemplate(accessToken, id, formData) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/space/uniformAdmin/templates/update/${id}/`,
        method: 'put',
        data: formData,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
        },
    })
}

