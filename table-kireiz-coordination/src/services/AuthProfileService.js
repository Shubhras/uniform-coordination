import ApiService from './ApiService'

/**
 * Fetches user profile details.
 * 
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response with user profile details.
 */
export async function apiGetProfile(token) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/space/userhub/profile/',
        method: 'get',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
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
//         url: '/v1/space/userhub/profile/update/',
//         method: 'put',
//         data: formData,
//         headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'multipart/form-data',
//         },
//     })
// }
export async function apiUpdateProfile(token, payload) {
    const formData = new FormData()

    formData.append('firstName', payload.firstName)
    formData.append('lastName', payload.lastName)
    formData.append('phone', payload.phone)

    if (payload.profileImage instanceof File) {
        formData.append('profileImage', payload.profileImage)
    }


    return ApiService.fetchDataWithAxios({
        url: '/v1/space/userhub/profile/update/',
        method: 'put',
        data: formData,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
}

/**
 * Updates user account password.
 * 
 * @param {string} token - User authentication Bearer token.
 * @param {Object} payload - Password update payload containing old_password and new_password.
 * @returns {Promise<Object>} API response confirming password update.
 */
export async function apiUpdatePassword(token, payload) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/space/userhub/update-password/',
        method: 'post',
        data: payload,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })
}

/**
 * Fetches user simulation history list.
 * 
 * @param {string} token - User authentication Bearer token.
 * @param {Object} [params={}] - Optional query parameters.
 * @returns {Promise<Object>} API response with simulation history items.
 */
export async function apiSimulationHistory(token, params = {}) {
    return ApiService.fetchDataWithAxios({
        url: "/v1/space/userhub/customupdateuser/get-list/",
        method: "get",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params,
    });
}

/**
 * Exports simulation model detail to PDF document.
 * 
 * @param {string} token - User authentication Bearer token.
 * @param {string|number} id - Model simulation ID to export.
 * @returns {Promise<Object>} API response containing PDF export file URL.
 */
export async function apiSimulationExportPdf(token, id) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/space/userhub/customupdatemodels/${id}/export/`,
        method: "get",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}
// export async function apiGetNotifications(token) {
//   return ApiService.fetchDataWithAxios({
//     url: "/v1/uniformAdmin/notifications/get-list/",
//     method: "get",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
// }