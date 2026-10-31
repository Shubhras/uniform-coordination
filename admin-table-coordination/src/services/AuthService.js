import ApiService from './ApiService'
import axios from 'axios'

export async function apiSignIn(data) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/space/uniformAdmin/login/',
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
    const payload = {
        ...data,
        userType: 'uniform',
    };
    return ApiService.fetchDataWithAxios({
        url: '/v1/space/uniformAdmin/forgot-password/',
        method: 'post',
        data: payload,
    })
}

export async function apiResetPassword(data) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/space/uniformAdmin/reset-password/',
        method: 'post',
        data,
    })
}

export async function apiChangePassword(data, accessToken) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/uniformAdmin/change-password/",
    method: "post",
    data,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}


export async function apiLogout(data, accessToken) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/uniformAdmin/logout/",
    method: "post",
    data,
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : {},
  });
}

export async function apiRefreshToken(refreshToken) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
  return axios.post(
    `${baseUrl}/api/v1/space/uniformAdmin/token/refresh/`,
    {
      refresh: refreshToken,
      refresh_token: refreshToken,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    }
  )
}