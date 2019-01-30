const RED_COLOR = 0xff0000;
const GREEN_COLOR = 0x00ff00;
const BLUE_COLOR = 0x0000ff;
const BITS_IN_TWO_BYTES = 16;
const BITS_IN_ONE_BYTE = 8;

export default function hexToRgb(value: string): [number, number, number] {
	let hexString;
	
	if (value.length === 4) {
		hexString = `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
	} else {
		hexString = `${value}`;
	}

	let hex = parseInt(hexString.substring(1), 16);

	return [(hex & RED_COLOR) >> BITS_IN_TWO_BYTES, (hex & GREEN_COLOR) >> BITS_IN_ONE_BYTE, hex & BLUE_COLOR]; // eslint-disable-line no-magic-numbers
}
