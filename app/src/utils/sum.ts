/**
 * Sums the number in an array (using Kahan summation algorithm).
 *
 * @param {Array<number>} array Array.
 * @returns {number} Sum.
 */
export default function sum(array: Array<number>): number {
	let s = 0;
	let c = 0;

	for (let i = 0; i < array.length; i++) {
		if (!isFinite(array[i])) {
			continue;
		}

		let y = array[i] - c;
		let t = s + y;

		c = t - s - y;
		s = t;
	}

	return s;
}
