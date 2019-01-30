import config from '../config/common';


const ROUTE_CLEANER_REGEX: RegExp = /^\s*[#\/]+|[#\/]*\s*$/g;

let urlRoot: string = config.urlRoot.replace(ROUTE_CLEANER_REGEX, '');

if (urlRoot.length) {
	urlRoot = `/${urlRoot}`;
}

export default urlRoot;
