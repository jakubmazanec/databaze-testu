let decodeBase64;

if ((global as any).btoa) {
	decodeBase64 = (global as any).atob;
} else {
	decodeBase64 = (value: any) => new Buffer(value, 'base64').toString();
}

export default decodeBase64;
