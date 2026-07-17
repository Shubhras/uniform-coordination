import ApiService from "./ApiService";

// export async function apiSignUp(data) {
//     console.log(data)
//     return ApiService.fetchDataWithAxios({
//         url: '/auth/sign-up',
//         method: 'post',
//         data,
//     })
// }

// export async function apiForgotPassword(data) {
//     return ApiService.fetchDataWithAxios({
//         url: '/auth/forgot-password',
//         method: 'post',
//         data,
//     })
// }

// export async function apiResetPassword(data) {
//     return ApiService.fetchDataWithAxios({
//         url: '/auth/reset-password',
//         method: 'post',
//         data,
//     })
// }

export async function apiSignUp(data) {
  const payload = {
    ...data,
    userType: "table",
  };
  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/signup/",
    method: "post",
    data: payload,
  });
}

export async function apiLogin(data) {
  const payload = {
    ...data,
    userType: "table",
  };

  console.log("Login payload:", payload);

  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/login/",
    method: "post",
    data: payload,
  });
}

export async function apiForgotPassword(data) {
  const payload = {
    ...data,
    userType: "table",
  };
  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/forgot-password/",
    method: "post",
    data: payload,
  });
}

export async function apiResetPassword(data) {
  const payload = {
    ...data,
    // userId: id,
    // userType: "table",
  };

  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/reset-password/",
    method: "post",
    data: payload,
  });
}


export async function verifyEmail(data) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/userhub/verify-user/',
        method: 'post',
        data,
    })
}
