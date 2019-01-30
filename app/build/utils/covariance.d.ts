/**
 * Calculates covariance (mean shifted to stabilize against catastrophic cancellation).
 *
 * @param {Array<number>} array1 First array.
 * @param {Array<number>} array2 Second array.
 * @returns {number} Covariance.
 */
declare function covariance(array1: Array<number>, array2: Array<number>): number;
export default covariance;
