/**
 * Format a number as Vietnamese currency (VND).
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

/**
 * Format a Date object as a Vietnamese locale date string.
 * @param {Date} date
 * @returns {string}
 */
export const formatDate = (date) =>
    new Date(date).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
