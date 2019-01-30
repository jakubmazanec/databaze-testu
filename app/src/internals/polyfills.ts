/* eslint-disable no-self-compare, no-extend-native */

import support from './support';
import constants from './constants';


const CLIENT_PLATFORM = constants.CLIENT_PLATFORM;

if (process.env.NODE_ENV === 'development' && support.platform === CLIENT_PLATFORM) {
	// require('inferno-devtools');
}

// Monkey patching to fix the URL of realfavicongenerator
// until https://github.com/evilebottnawi/favicons/pull/188 is merged
let NodeRestClient = require('node-rest-client');
let origClient = NodeRestClient.Client;

NodeRestClient.Client = function () {
	let client = new origClient(arguments[0], arguments[1], arguments[2]);
	let origPost = client.post;

	client.post = function (this: any, url: string) {
		if (url === 'http://realfavicongenerator.net/api/favicon') {
			console.log('Monkey patching: using HTTPS url of realfavicongenerator');
			arguments[0] = 'https://realfavicongenerator.net/api/favicon';
		}

		return origPost.apply(this, arguments);
	};

	return client;
};

function includes(this: any, searchElement: any, fromIndex = 0) {
	if (this === null) {
		throw new TypeError('Array.prototype.includes called on null or undefined');
	}

	let O = Object(this);
	let len = parseInt(O.length, 10) || 0;

	if (len === 0) {
		return false;
	}

	let n = parseInt(fromIndex as any, 10);
	let k;

	if (n >= 0) {
		k = n;
	} else {
		k = len + n;

		if (k < 0) {
			k = 0;
		}
	}

	let currentElement;

	while (k < len) {
		currentElement = O[k];

		if (searchElement === currentElement || (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
			return true;
		}

		k++;
	}

	return false;
}

if (!Array.prototype.includes) {
	Array.prototype.includes = includes;
}

function areIntlLocalesSupported(...locales: Array<string>) {
	if (typeof Intl === 'undefined') {
		return false;
	}

	let intlConstructors = [
		Intl.Collator,
		Intl.DateTimeFormat,
		Intl.NumberFormat
	].filter((intlConstructor) => intlConstructor);

	if (intlConstructors.length === 0) {
		return false;
	}

	return intlConstructors.every((intlConstructor) => {
		let supportedLocales = (intlConstructor as any).supportedLocalesOf(locales);

		return supportedLocales.length === locales.length;
	});
}

if (global.Intl) {
	// Determine if the built-in `Intl` has the locale data we need.
	if (!areIntlLocalesSupported('cs-CZ')) {
		// `Intl` exists, but it doesn't have the data we need, so load the
		// polyfill and patch the constructors we need with the polyfill's.
		let IntlPolyfill = require('intl');

		Intl.NumberFormat = IntlPolyfill.NumberFormat;
		Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;
	}
} else {
	// No `Intl`, so use and load the polyfill.
	global.Intl = require('intl');
}
