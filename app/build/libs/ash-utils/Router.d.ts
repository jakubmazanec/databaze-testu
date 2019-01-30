import Stream from './Stream';
/**
 * Route regular expression.
 */
export interface RouteRegExp extends RegExp {
    parameterNames: Array<string>;
}
/**
 * Route interface.
 */
export interface RouteParametersResult {
    context?: any;
    [parameter: string]: string | null;
}
export declare type RouteStream = Stream<RouteParametersResult>;
export interface Route {
    route: RouteRegExp;
    stream: RouteStream;
}
/**
 * Router class.
 */
export default class Router {
    routes: Array<Route>;
    trigger(fragment?: string, context?: any): boolean;
    /**
     * Creates route.
     *
     * @param {string} route
     * @param {?Stream} stream
     * @returns {Stream}
     */
    add(route: string, stream?: RouteStream): RouteStream;
}
