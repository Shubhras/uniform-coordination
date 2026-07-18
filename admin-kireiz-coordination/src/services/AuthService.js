import ApiService from "./ApiService";

export async function apiSignIn(data) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/login/",
    method: "post",
    data,
  });
}

export async function apiSignUp(data) {
  console.log(data);
  return ApiService.fetchDataWithAxios({
    url: "/auth/sign-up",
    method: "post",
    data,
  });
}

export async function apiForgotPassword(data) {
  const payload = {
    ...data,
    userType: "uniform",
  };
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/forgot-password/",
    method: "post",
    data: payload,
  });
}

export async function apiResetPassword(data) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/change-password/",
    method: "post",
    data,
  });
}

export async function apiChangePassword(data, accessToken) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/reset-password/",
    method: "post",
    data,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function apiLogout(data,accessToken) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/logout/",
    method: "post",
    data,
        headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
