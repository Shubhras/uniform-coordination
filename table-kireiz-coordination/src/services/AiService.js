import ApiService from './ApiService'

/**
 * Posts a user message to the AI chatbot assistant API.
 * 
 * @param {Object} data - Payload containing user message prompt.
 * @returns {Promise<Object>} API response with AI assistant message response.
 */
export async function apiPostChat(data) {
    return ApiService.fetchDataWithAxios({
        url: '/ai/chat',
        method: 'post',
        data,
    })
}

/**
 * Fetches user chat conversation history logs.
 * 
 * @returns {Promise<Object>} API response with chat history messages.
 */
export async function apiGetChatHistory() {
    return ApiService.fetchDataWithAxios({
        url: '/ai/chat/history',
        method: 'get',
    })
}

/**
 * Fetches generated AI image assets list.
 * 
 * @param {Object} [params] - Query parameters for filtering images.
 * @returns {Promise<Object>} API response with generated AI images.
 */
export async function apiGetImages(params) {
    return ApiService.fetchDataWithAxios({
        url: '/ai/images',
        method: 'get',
        params,
    })
}

/**
 * Triggers AI image generation request.
 * 
 * @param {Object} data - Payload with image generation prompt and configuration parameters.
 * @returns {Promise<Object>} API response with newly generated image metadata.
 */
export async function apiPostImages(data) {
    return ApiService.fetchDataWithAxios({
        url: '/ai/images',
        method: 'post',
        data,
    })
}

