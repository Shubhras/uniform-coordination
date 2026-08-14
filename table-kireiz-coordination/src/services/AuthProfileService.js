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
export async function apiSimulationExportPdf(token, id, isTheme = false) {
    const url = isTheme 
        ? `/v1/space/userhub/customupdatethemes/${id}/export/`
        : `/v1/space/userhub/customupdatemodels/${id}/export/`
    return ApiService.fetchDataWithAxios({
        url: url,
        method: "get",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}
export async function apiGetUserNotifications(token) {
    return ApiService.fetchDataWithAxios({
        url: "/v1/space/userhub/notifications/list/",
        method: "get",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function apiMarkNotificationRead(token, id = null) {
    const url = id 
        ? `/v1/space/userhub/notifications/mark-read/${id}/`
        : `/v1/space/userhub/notifications/mark-read/`
    return ApiService.fetchDataWithAxios({
        url: url,
        method: "post",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function apiDeleteNotification(token, id) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/space/userhub/notifications/delete/${id}/`,
        method: "delete",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

/**
 * Toggles favorite status of a product.
 * 
 * @param {string} token - User authentication Bearer token.
 * @param {string|number} productId - Target product ID.
 * @returns {Promise<Object>} API response with status and toggled state.
 */
export async function apiToggleProductFavourite(token, productId) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/space/userhub/favourite/toggle/',
        method: 'post',
        data: { product_id: productId },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
}

/**
 * Toggles favorite status of a table theme.
 * 
 * @param {string} token - User authentication Bearer token.
 * @param {string|number} themeId - Target theme ID.
 * @returns {Promise<Object>} API response with status and toggled state.
 */
export async function apiToggleThemeFavourite(token, themeId) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/space/userhub/theme/favourite/toggle/',
        method: 'post',
        data: { theme_id: themeId },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
}