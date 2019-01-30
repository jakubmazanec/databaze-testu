/* eslint-disable no-magic-numbers */
/**
 * Computes product of an array (using compensated product method)
 *
 * @param {Array<number>} array Array.
 * @returns {number} Product.
 */
export default function product(array) {
    let p_ = array[0];
    let e_ = 0;
    for (let i = 1; i < array.length; i++) {
        if (!isFinite(array[i])) {
            continue;
        }
        let x = p_ * array[i];
        let cA = (Math.pow(2, 27) + 1) * p_;
        let xA = cA - (cA - p_);
        let A = [xA, p_ - xA];
        let cB = (Math.pow(2, 27) + 1) * array[i];
        let xB = cB - (cB - array[i]);
        let B = [xB, array[i] - xB];
        let y = A[1] * B[1] - (x - A[0] * B[0] - A[1] * B[0] - A[0] * B[1]);
        p_ = x;
        e_ = e_ * array[i] + y;
    }
    return p_ + e_;
}