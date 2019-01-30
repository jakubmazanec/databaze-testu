import hexToRgb from './hexToRgb';


export default function hexToRgbaString(value: string, transparency = 1) {
	let rgbValue = hexToRgb(value);
	
	return `rgba(${rgbValue[0]}, ${rgbValue[1]}, ${rgbValue[2]}, ${transparency})`;
}
