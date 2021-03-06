import covariance from './covariance';
/**
 * Calculates variance of array of numbers.
 *
 * @param {Array<number>} array Array of numbers
 * @returns {number} Calculated variance
 */
export default function variance(array) {
  return covariance(array, array);
}