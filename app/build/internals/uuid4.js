/* eslint-disable no-magic-numbers, prefer-template */
let lt = [];
for (let i = 0; i < 256; i++) {
    lt[i] = (i < 16 ? '0' : '') + i.toString(16);
}
export default function uuid4() {
    let d0 = Math.random() * 0xffffffff | 0;
    let d1 = Math.random() * 0xffffffff | 0;
    let d2 = Math.random() * 0xffffffff | 0;
    let d3 = Math.random() * 0xffffffff | 0;
    return lt[d0 & 0xff] + lt[d0 >> 8 & 0xff] + lt[d0 >> 16 & 0xff] + lt[d0 >> 24 & 0xff] + '-' + lt[d1 & 0xff] + lt[d1 >> 8 & 0xff] + '-' + lt[d1 >> 16 & 0x0f | 0x40] + lt[d1 >> 24 & 0xff] + '-' + lt[d2 & 0x3f | 0x80] + lt[d2 >> 8 & 0xff] + '-' + lt[d2 >> 16 & 0xff] + lt[d2 >> 24 & 0xff] + lt[d3 & 0xff] + lt[d3 >> 8 & 0xff] + lt[d3 >> 16 & 0xff] + lt[d3 >> 24 & 0xff];
}