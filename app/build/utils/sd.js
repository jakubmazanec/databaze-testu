import covariance from './covariance';
/**
 * Calculates standard deviation of array of numbers.
 *
 * @param {Array<number>} array Array of numbers
 * @returns {number}
 */
export default function sd(array) {
  return Math.sqrt(covariance(array, array));
}