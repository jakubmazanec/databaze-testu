import {Router, RouteStream} from '../libs/ash-utils';

import router from './router';
import constants from '../internals/constants';
import urlRoot from '../internals/urlRoot';
import support from '../internals/support';


const EN_US = constants.EN_US;
const CS_CZ = constants.CS_CZ;
const CS = constants.CS;
const LANGUAGE_REGEX = new RegExp(CS);
const CLIENT_PLATFORM = constants.CLIENT_PLATFORM;

let routeStream: RouteStream = router.add(`${urlRoot}(/)(:language)(/:page)(/:pageId)(/:pageName)(/)`).map((value) => {
	let {language, page, pageId, pageName} = value;

	/*if (process.env.NODE_ENV === 'production' && support.platform === CLIENT_PLATFORM) {
		let routeString = '';

		if (language) {
			routeString += `/${language}`;
		}

		if (page) {
			routeString += `/${page}`;
		}

		if (pageId) {
			routeString += `/${pageId}`;
		}

		if (pageName) {
			routeString += `/${pageName}`;
		}

		if (!routeString) {
			routeString = '/';
		}

		(global as any).ga('set', 'page', routeString);
		(global as any).ga('send', 'pageview');
	}*/

	if (typeof window !== 'undefined' && window.history && window.history.state && typeof window.history.state.scroll !== 'undefined') {
		if (window.history.state.scroll <= 10) {
			requestAnimationFrame(() => {
				window.scrollTo(0, window.history.state.scroll);
			});
		} else {
			setTimeout(() => {
				window.scrollTo(0, window.history.state.scroll);
			}, 40);
		}
	}

	if (language !== CS_CZ && language !== EN_US) {
		pageName = pageId;
		pageId = page;
		page = language;
		language = EN_US;
	}

	if (page === 'user') {

	} else if (page === 'method') {

	} else if (page === 'resource') {

	} else if (page === 'resources') {

	} else if (page === 'login') {
		pageId = null;
		pageName = null;
	} else if (page === 'signup') {
		pageId = null;
		pageName = null;
	} else if (page === 'verify-email') {
		pageName = null;
	} else if (page === 'forgotten-password') {
		pageId = null;
		pageName = null;
	} else if (page === 'reset-password') {
		pageName = null;
	} else {
		page = 'methods';
		pageId = null;
		pageName = null;
	}

	return {language, page, pageId, pageName};
});

export default routeStream;
