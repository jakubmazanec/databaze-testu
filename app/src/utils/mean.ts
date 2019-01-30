import product from './product';
import sum from './sum';


/**
 * Calculates mean of array of numbers.
 *
 * @param {Array<number>} array Array of numbers
 * @returns {number} Calculated mean
 */
export default function mean(array: Array<number>): number {
	return product([sum(array), 1 / array.length]);
}
