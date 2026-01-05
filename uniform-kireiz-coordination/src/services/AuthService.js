import ApiService from './ApiService'

export async function apiSignUp(data) {
    console.log(data)
    return ApiService.fetchDataWithAxios({
        url: '/v1/userhub/signup/',
        method: 'post',
        data,
    })
}

export async function apiForgotPassword(data) {
    return ApiService.fetchDataWithAxios({
        url: '/auth/forgot-password',
        method: 'post',
        data,
    })
}

export async function apiResetPassword(data) {
    return ApiService.fetchDataWithAxios({
        url: '/auth/reset-password',
        method: 'post',
        data,
    })
}
