import ApiService from "./ApiService";

export async function apiSignUp(data) {
  const payload = {
    ...data,
    userType: "table",
  };
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/userhub/signup/",
    method: "post",
    data: payload,
  });
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
    userType: "table",
  };

  return ApiService.fetchDataWithAxios({
    url: "/v1/space/userhub/login/",
    method: "post",
    data: payload,
  });
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
    userType: "table",
  };
  return ApiService.fetchDataWithAxios({
    url: "/v1/space/userhub/forgot-password/",
    method: "post",
    data: payload,
  });
}

/**
 * Resets user password using reset token and new password credentials.
 * 
 * @param {Object} data - Payload containing reset token and new password.
 * @returns {Promise<Object>} API response confirming password reset success.
 */
export async function apiResetPassword(data) {
  const payload = {
    ...data,
  };

  return ApiService.fetchDataWithAxios({
    url: "/v1/space/userhub/reset-password/",
    method: "post",
    data: payload,
  });
}

/**
 * Verifies user email verification token.
 * 
 * @param {Object} data - Email verification token payload.
 * @returns {Promise<Object>} API response with verification status.
 */
export async function verifyEmail(data) {
  return ApiService.fetchDataWithAxios({
    url: '/v1/space/userhub/verify-user/',
    method: 'post',
    data,
  });
}

