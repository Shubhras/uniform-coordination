import ApiService from "./ApiService";

// export async function apiSignUp(data) {
//     alert("Signup API called");
//     console.log(data)
//     return ApiService.fetchDataWithAxios({
//         url: '/v1/userhub/signup/',
//         method: 'post',
//         data,
//     })
// }
export async function apiSignUp(data) {
  const payload = {
    ...data,
    userType: "uniform",
  };
  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/signup/",
    method: "post",
    data: payload,
  });
}

/**
 * LOGIN
 */
export async function apiLogin(data) {
  const payload = {
    ...data,
    userType: "uniform",
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
    userType: "uniform",
  };
  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/forgot-password/",
    method: "post",
    data: payload,
  });
}

export async function apiResetPassword(data) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/reset-password/",
    method: "post",
    data,
  });
}


export async function verifyEmail(data) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/userhub/verify-user/',
        method: 'post',
        data,
    })
}
