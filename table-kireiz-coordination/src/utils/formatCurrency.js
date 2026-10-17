/**
 * Formats a currency amount based on the provided currency code.
 * Defaults to USD if no currency code is provided or is unrecognized.
 *
 * @param {number|string} amount - The amount to format
 * @param {string} currencyCode - The currency code (e.g. 'USD', 'JPY', 'EUR')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyCode = 'JPY') => {
    const numericAmount = Number(amount || 0)
    const symbol = getCurrencySymbol(currencyCode)
    return `${symbol}${numericAmount.toLocaleString()}`
}

/**
 * Returns the currency symbol for a given currency code.
 * Defaults to '¥' for JPY.
 *
 * @param {string} currencyCode - The currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currencyCode = 'JPY') => {
    const code = (currencyCode || 'JPY').toUpperCase()
    switch (code) {
        case 'JPY':
        case 'CNY':
            return '¥'
        case 'USD':
            return '$'
        case 'EUR':
            return '€'
        case 'GBP':
            return '£'
        case 'INR':
            return '₹'
        default:
            return '¥'
    }
}

export default formatCurrency
