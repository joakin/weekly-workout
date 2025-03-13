/**
 * @typedef {Object} NumberRange
 * @property {number} min
 * @property {number} [max]
 */

/**
 * @param {NumberRange} range
 * @returns {string}
 */
export function formatRange(range) {
    return range.max ? `${range.min}-${range.max}` : range.min.toString();
}
