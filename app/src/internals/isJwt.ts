const JWT_REGEX = /^[0-9a-zA-Z]*\.[0-9a-zA-Z]*\.[0-9a-zA-Z-_]*$/;

export default function isJwt(value: string): boolean {
	return JWT_REGEX.test(value);
}
