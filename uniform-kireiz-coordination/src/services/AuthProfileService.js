import ApiService from "./ApiService";

export async function apiGetProfile(token) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/profile/",
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// export async function apiUpdateProfile(token, payload) {
//     //console.log('qqq',payload);

//     const formData = new FormData()
//     formData.append('firstName', payload.firstName || '')
//     formData.append('lastName', payload.lastName || '')
//     formData.append('phone', payload.phone || '')

//     // Only append file if it's a new File
//    // if (payload.profileImage instanceof File) {
//         formData.append('profileImage', payload.profileImage)
//     //}

//     return ApiService.fetchDataWithAxios({
//         url: '/v1/userhub/profile/update/',
//         method: 'put',
//         data: formData,
//         headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'multipart/form-data',
//         },
//     })
// }
export async function apiUpdateProfile(token, payload) {
  const formData = new FormData();

  formData.append("firstName", payload.firstName);
  formData.append("lastName", payload.lastName);
  formData.append("phone", payload.phone);

  if (payload.profileImage instanceof File) {
    formData.append("profileImage", payload.profileImage);
  }

  // 🔍 Debug (optional)
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/profile/update/",
    method: "put",
    data: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
export async function apiUpdatePassword(token, payload) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/update-password/",
    method: "post",
    data: payload,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}
export async function apiSimulationHistory(token, params = {}) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/customupdateuser/get-list/",
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
}

export async function apiOrderAndQuotation(token, params = {}) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/orderhistory/get-list/",
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
}

export async function apiGetOrderDetail(token, data) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/userhub/order/id/`,
    method: "post",
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function apiSimulationExportPdf(token, id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/userhub/customupdatemodels/${id}/export/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}


export async function apiGetQuotation(token, params = {}) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/userhub/quotationrequest/get-list/",
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
}

export async function apiGetNotifications(token) {
  return ApiService.fetchDataWithAxios({
    url: "/v1/uniformAdmin/notifications/get-list/",
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
