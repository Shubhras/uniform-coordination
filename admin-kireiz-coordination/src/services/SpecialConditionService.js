import ApiService from './ApiService'

export async function apiGetSpecialConditionList(accessToken) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/specialcondition/get-list/`,
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export async function apiUpdateSpecialCondition(accessToken, id, payload) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/specialcondition/${id}/update/`,
        method: 'put',
        data: payload,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}
