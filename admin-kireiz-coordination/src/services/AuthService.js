import ApiService from './ApiService'

export async function apiSignIn(data) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/uniformAdmin/login/',
        method: 'post',
        data,
    })
}

export async function apiSignUp(data) {
    console.log(data)
    return ApiService.fetchDataWithAxios({
        url: '/auth/sign-up',
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
