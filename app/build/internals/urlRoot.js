import config from '../config/common';
const ROUTE_CLEANER_REGEX = /^\s*[#\/]+|[#\/]*\s*$/g;
let urlRoot = config.urlRoot.replace(ROUTE_CLEANER_REGEX, '');
if (urlRoot.length) {
    urlRoot = `/${urlRoot}`;
}
export default urlRoot;