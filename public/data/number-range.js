// @ts-check

/**
 * @typedef {{min: number, max?: number}} NumberRange
 */

/**
 * @param {NumberRange} range
 * @returns {string}
 */
export function formatRange(range) {
    return range.max ? `${range.min}-${range.max}` : `${range.min}`;
}
