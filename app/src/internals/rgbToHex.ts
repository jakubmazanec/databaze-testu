export type RgbColor = [number, number, number];

export default function rgbToHex(value: RgbColor): string {
	return '#' + ((1 << 24) + (Math.round(value[0]) << 16) + (Math.round(value[1]) << 8) + Math.round(value[2])).toString(16).slice(1);
}
