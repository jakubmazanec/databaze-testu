let encodeBase64: (value: any) => string;

if ((global as any).btoa) {
	encodeBase64 = (global as any).btoa;
} else {
	encodeBase64 = (value: any): string => new Buffer(value).toString('base64');
}

export default encodeBase64;
