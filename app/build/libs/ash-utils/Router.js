import Stream from './Stream';
// regex for stripping a leading hash/slash and trailing space.
const ROUTE_STRIPPER = /^\s+$/g;
// regexes for matching named parameter parts and splatted parts of route strings.
const OPTIONAL_PARAM = /\((.*?)\)/g;
const NAMED_PARAM = /(\(\?)?:\w+/g;
const SPLAT_PARAM = /\*\w+/g;
const ESCAPE_REGEX = /[\-{}\[\]+?.,\\\^$|#\s]/g;
/**
 * Convert a route string into a regular expression, suitable for matching against the current location hash.
 *
 * @param {string} route
 * @returns {RegExp}
 */
function routeToRegExp(route) {
    let parameterNames = [];
    let routeRegExp = new RegExp(`^${route.replace(ESCAPE_REGEX, '\\$&').replace(OPTIONAL_PARAM, '(?:$1)?').replace(NAMED_PARAM, (match, optional) => {
        parameterNames.push(match.slice(1));
        return optional ? match : '([^/?]+)';
    }).replace(SPLAT_PARAM, '([^?]*?)')}(?:\\?([\\s\\S]*))?$`);
    routeRegExp.parameterNames = parameterNames;
    return routeRegExp;
}
/**
 * Given a route, and a URL fragment that it matches, return the array of extracted decoded parameters. Empty or unmatched parameters will be treated as `null` to normalize cross-browser behavior.
 *
 * @param {RegExp} routeRegExp
 * @param {string} fragment
 * @returns {Array}
 */
function extractParameters(routeRegExp, fragment) {
    let allParameters = routeRegExp.exec(fragment);
    if (allParameters) {
        let parameters = allParameters.slice(1);
        return parameters.map((parameter, index) => {
            if (parameters && index === parameters.length - 1) {
                // don't decode the search parameters
                return parameter || null;
            }
            return parameter ? decodeURIComponent(parameter) : null;
        });
    }
    return null;
}
/**
 * Normalizes path fragment by stripping trailing space.
 *
 * @param {string} fragment
 * @returns {string}
 */
function normalizePathFragment(fragment) {
    return fragment.replace(ROUTE_STRIPPER, '');
}
/**
 * Router class.
 */
export default class Router {
    constructor() {
        this.routes = [];
    }
    trigger(fragment = '', context) {
        let normalizedFragment = normalizePathFragment(fragment);
        for (let i = 0; i < this.routes.length; i++) {
            if (this.routes[i].route.test(normalizedFragment)) {
                let parameterNames = this.routes[i].route.parameterNames.concat('search');
                let parameters = extractParameters(this.routes[i].route, normalizedFragment);
                let result = {};
                if (parameters) {
                    for (let j = 0; j < parameterNames.length; j++) {
                        result[parameterNames[j]] = parameters[j];
                    }
                    if (context) {
                        result.context = context;
                    }
                    this.routes[i].stream.push(result);
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Creates route.
     *
     * @param {string} route
     * @param {?Stream} stream
     * @returns {Stream}
     */
    add(route, stream) {
        this.routes.unshift({
            route: routeToRegExp(route),
            stream: stream instanceof Stream ? stream : new Stream()
        });
        return this.routes[0].stream;
    }
}