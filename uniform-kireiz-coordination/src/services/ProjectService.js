import ApiService from './ApiService'

/**
 * Fetches list of scrum boards for project management.
 *
 * @returns {Promise<Object>} API response with scrum board data.
 */
export async function apiGetScrumBoards() {
    return ApiService.fetchDataWithAxios({
        url: '/projects/scrum-board',
        method: 'get',
    })
}

/**
 * Fetches project team members list for scrum boards.
 *
 * @returns {Promise<Object>} API response with project members.
 */
export async function apiGetProjectMembers() {
    return ApiService.fetchDataWithAxios({
        url: '/projects/scrum-board/members',
        method: 'get',
    })
}

/**
 * Fetches specific project details by project ID with optional params.
 *
 * @param {Object} options - Options containing project ID and extra params.
 * @param {string|number} options.id - Project ID.
 * @param {Object} [options.params] - Additional query parameters.
 * @returns {Promise<Object>} API response with detailed project data.
 */
export async function apiGetProject({ id, ...params }) {
    return ApiService.fetchDataWithAxios({
        url: `/projects/${id}`,
        method: 'get',
        params,
    })
}
