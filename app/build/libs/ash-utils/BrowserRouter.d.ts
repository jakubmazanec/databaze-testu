import Router from './Router';
/**
 * BrowserRouter class.
 * Singleton.
 */
export default class BrowserRouter {
    private location;
    private history;
    private fragment;
    private router;
    private root;
    private isSilent;
    isStarted: boolean;
    /**
     * Creates a browserRouter instance.
     *
     * @returns {BrowserRouter}
     */
    constructor(router: Router);
    /**
     * Are we at the app root?
     */
    readonly isAtRoot: boolean;
    /**
     * In IE6, the hash fragment and search params are incorrect if the fragment contains `?`
     */
    readonly search: string;
    /**
     * Get the pathname and search params, without the root.
     */
    readonly path: string;
    /**
     *
     * Starts the router.
     * @param {string} options.root
     * @param {boolean} options.isSilent
     * @returns {boolean}
     */
    start({root, isSilent}?: {
        root?: string;
        isSilent?: boolean;
    }): boolean;
    handlePopState: () => boolean;
    /**
     * Stops the router.
     *
     * @returns {boolean}
     */
    stop(): boolean;
    /**
     * Updates the URL.
     * Works iff router is started and the script is running in browser.
     *
     * @param {string} fragment
     * @param {boolean} options.trigger
     * @param {boolean} options.replace
     * @returns {boolean}
     */
    navigate(fragment?: string, {trigger, replace, resetScrollPosition}?: {
        trigger?: boolean;
        replace?: boolean;
        resetScrollPosition?: boolean;
    }): boolean;
}
