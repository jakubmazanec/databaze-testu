import hexToRgb from './hexToRgb';
import rgbToHex from './rgbToHex';


export default function tintHex(value: string, factor = 0) {
	let rgbValue = hexToRgb(value);

	rgbValue[0] += (255 - rgbValue[0]) * factor;
	rgbValue[1] += (255 - rgbValue[1]) * factor;
	rgbValue[2] += (255 - rgbValue[2]) * factor;

	return rgbToHex(rgbValue);
}
