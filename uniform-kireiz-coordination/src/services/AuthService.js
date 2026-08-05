import ApiService from './ApiService'

/**
 * Registers a new user account with uniform application user type.
 *
 * @param {Object} data - User sign up registration data payload.
 * @returns {Promise<Object>} API response with user registration details.
 */
export async function apiSignUp(data) {
  const payload = {
    ...data,
    userType: 'uniform',
  }
  return ApiService.fetchDataWithAxios({
    url: '/v1/userhub/signup/',
    method: 'post',
    data: payload,
  })
}

/**
 * Authenticates user credentials and returns session tokens.
 *
 * @param {Object} data - Login credentials payload containing email and password.
 * @returns {Promise<Object>} API response containing authentication token and user info.
 */
export async function apiLogin(data) {
  const payload = {
    ...data,
    userType: 'uniform',
  }

  return ApiService.fetchDataWithAxios({
    url: '/v1/userhub/login/',
    method: 'post',
    data: payload,
  })
}

/**
 * Triggers forgot password email recovery request.
 *
 * @param {Object} data - Password recovery payload containing user email.
 * @returns {Promise<Object>} API response confirming recovery email dispatch.
 */
export async function apiForgotPassword(data) {
  const payload = {
    ...data,
    userType: 'uniform',
  }
  return ApiService.fetchDataWithAxios({
    url: '/v1/userhub/forgot-password/',
    method: 'post',
    data: payload,
  })
}

/**
 * Resets user password using reset token and new password credentials.
 *
 * @param {Object} data - Payload containing reset token and new password.
 * @returns {Promise<Object>} API response confirming password reset success.
 */
export async function apiResetPassword(data) {
  return ApiService.fetchDataWithAxios({
    url: '/v1/userhub/reset-password/',
    method: 'post',
    data,
  })
}

/**
 * Verifies user email account using token payload.
 *
 * @param {Object} data - Email verification token payload.
 * @returns {Promise<Object>} API response with verification status.
 */
export async function verifyEmail(data) {
  return ApiService.fetchDataWithAxios({
    url: '/v1/userhub/verify-user/',
    method: 'post',
    data,
  })
}

