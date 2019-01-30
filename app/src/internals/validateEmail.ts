const EMAIL_REGEX = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export default function validateEmail(email: string): string | false {
	if (!email) {
		return false;
	}
	
	let trimmedEmail = `${email}`.trim();
	let result = EMAIL_REGEX.test(trimmedEmail);

	return result ? trimmedEmail : false;
}
