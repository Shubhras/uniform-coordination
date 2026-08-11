/**
 * Formats a currency amount based on the provided currency code.
 * Defaults to USD if no currency code is provided or is unrecognized.
 *
 * @param {number|string} amount - The amount to format
 * @param {string} currencyCode - The currency code (e.g. 'USD', 'JPY', 'EUR')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyCode) => {
    const numericAmount = Number(amount || 0)
    const symbol = getCurrencySymbol(currencyCode)
    return `${symbol}${numericAmount.toLocaleString()}`
}

/**
 * Returns the currency symbol for a given currency code.
 * Defaults to '$' for USD.
 *
 * @param {string} currencyCode - The currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currencyCode) => {
    const code = (currencyCode || 'USD').toUpperCase()
    switch (code) {
        case 'USD':
            return '$'
        case 'EUR':
            return '€'
        case 'GBP':
            return '£'
        case 'JPY':
        case 'CNY':
            return '¥'
        case 'INR':
            return '₹'
        default:
            return '$'
    }
}

export default formatCurrency
