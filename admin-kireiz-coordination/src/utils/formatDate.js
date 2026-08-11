/**
 * Date formatting utilities used across the application.
 */

/**
 * Formats a date string into 'DD MMM YYYY' format (en-GB).
 * Example: '01 Jan 2024'
 * Used in Profile, Active Orders, Completed Orders, Order Rental Details.
 *
 * @param {string|Date} dateStr - Date string or Date object to format
 * @returns {string} Formatted date string, or original string/empty if invalid
 */
export const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return dateStr
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    } catch {
        return dateStr
    }
}

/**
 * Formats a date string into 'YYYY-MM-DD' ISO format.
 * Example: '2024-01-01'
 * Used in Blog components.
 *
 * @param {string|Date} dateStr - Date string or Date object to format
 * @returns {string} Formatted ISO date string, or empty string if invalid
 */
export const formatISODate = (dateStr) => {
    if (!dateStr) return ''
    try {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return ''
        return date.toISOString().split('T')[0]
    } catch {
        return ''
    }
}

/**
 * Formats a date string into 'MMM D, YYYY' format (en-US).
 * Example: 'Jan 1, 2024'
 * Used in Simulation History.
 *
 * @param {string|Date} dateStr - Date string or Date object to format
 * @returns {string} Formatted date string, or empty string if invalid
 */
export const formatUSDate = (dateStr) => {
    if (!dateStr) return ''
    try {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return ''
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    } catch {
        return ''
    }
}

export default formatDate
