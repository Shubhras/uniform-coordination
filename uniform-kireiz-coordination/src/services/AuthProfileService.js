import ApiService from './ApiService'

/**
 * Fetches user profile details.
 *
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response with user profile details.
 */
export async function apiGetProfile(token) {
  return ApiService.fetchDataWithAxios({
    url: '/v1/userhub/profile/',
    method: 'get',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

/**
 * Updates user profile details including first name, last name, phone, and optional profile image.
 *
 * @param {string} token - User authentication Bearer token.
 * @param {Object} payload - User profile update data.
 * @param {string} payload.firstName - User's first name.
 * @param {string} payload.lastName - User's last name.
 * @param {string} payload.phone - User's phone number.
 * @param {File} [payload.profileImage] - Optional profile avatar image file.
 * @returns {Promise<Object>} API response with updated user profile data.
 */
export async function apiUpdateProfile(token, payload) {
  const formData = new FormData()

  formData.append('firstName', payload.firstName)
  formData.append('lastName', payload.lastName)
  formData.append('phone', payload.phone)

  if (payload.profileImage instanceof File) {
    formData.append('profileImage', payload.profileImage)
  }

  return ApiService.fetchDataWithAxios({
    url: '/v1/userhub/profile/update/',
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
 * @param {Object} payload - Password update payload containing old and new passwords.
 * @returns {Promise<Object>} API response confirming password update.
 */
export async function apiUpdatePassword(token, payload) {
  return ApiService.fetchDataWithAxios({
    url: '/v1/userhub/update-password/',
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
 * @param {number} [page=1] - Page number for pagination.
 * @param {number} [pageSize=8] - Number of items per page.
 * @param {Object} [params={}] - Additional query parameters.
 * @returns {Promise<Object>} API response with simulation history list.
 */
export async function apiSimulationHistory(
  token,
  page = 1,
  pageSize = 8,
  params = {},
) {
  return ApiService.fetchDataWithAxios({
    url: '/v1/userhub/customupdateuser/get-list/',
    method: 'get',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page,
      page_size: pageSize,
      ...params,
    },
  })
}

/**
 * Fetches user order and quotation history list.
 *
 * @param {string} token - User authentication Bearer token.
 * @param {Object} [params={}] - Optional query parameters.
 * @returns {Promise<Object>} API response with order & quotation list.
 */
export async function apiOrderAndQuotation(token, params = {}) {
  return ApiService.fetchDataWithAxios({
    url: '/v1/userhub/orderhistory/get-list/',
    method: 'get',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  })
}

/**
 * Fetches specific order details by ID.
 *
 * @param {string} token - User authentication Bearer token.
 * @param {Object} data - Payload containing order ID request parameter.
 * @returns {Promise<Object>} API response with detailed order information.
 */
export async function apiGetOrderDetail(token, data) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/userhub/order/id/`,
    method: 'post',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
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
    url: `/v1/userhub/customupdatemodels/${id}/export/`,
    method: 'get',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

/**
 * Fetches quotation request list for the authenticated user.
 *
 * @param {string} token - User authentication Bearer token.
 * @param {Object} [params={}] - Optional query parameters.
 * @returns {Promise<Object>} API response with list of user quotation requests.
 */
export async function apiGetQuotation(token, params = {}) {
  return ApiService.fetchDataWithAxios({
    url: '/v1/userhub/quotationrequest/get-list/',
    method: 'get',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  })
}

/**
 * Fetches notifications list for the user/admin.
 *
 * @param {string} token - User authentication Bearer token.
 * @returns {Promise<Object>} API response with user notifications list.
 */
export async function apiGetNotifications(token, page = 1) {
  return ApiService.fetchDataWithAxios({
    url: '/v1/userhub/notifications/get-list/',
    method: 'get',
    params: { page },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

