import mean from './mean';


/**
 * Calculates covariance (mean shifted to stabilize against catastrophic cancellation).
 *
 * @param {Array<number>} array1 First array.
 * @param {Array<number>} array2 Second array.
 * @returns {number} Covariance.
 */
function covariance(array1: Array<number>, array2: Array<number>): number {
	let n = array1.length;

	if (n < 2) {
		return 0;
	}

	let m1 = mean(array1);
	let m2 = mean(array2);
	let result = 0;

	for (let i = 0; i < array1.length; i++) {
		let a = array1[i] - m1;
		let b = array2[i] - m2;

		result += a * b / (n - 1);
	}
	
	return result;
}

export default covariance;
