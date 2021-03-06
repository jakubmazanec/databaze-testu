import _ from 'lodash';
import $ from 'jquery';

import Router from './Router';


// regex for stripping a leading hash/slash and trailing space.
const ROUTE_STRIPPER: RegExp = /^\s+$/g;

// regex for stripping leading and trailing slashes.
const ROOT_STRIPPER: RegExp = /^\/+|\/+$/g;

// regex for stripping urls of hash.
const PATH_STRIPPER: RegExp = /#.*$/;


/**
 * Normalizes path fragment by stripping a leading hash/slash and trailing space.
 *
 * @param {string} fragment
 * @returns {string}
 */
function normalizePathFragment(fragment: string): string {
	return fragment.replace(ROUTE_STRIPPER, '');
}

let browserRouter: BrowserRouter;


/**
 * BrowserRouter class.
 * Singleton.
 */
export default class BrowserRouter {
	private location: Location = (global as any).location;
	private history: History = (global as any).history;
	private fragment: string = '';
	private router: Router;
	private root: string = '';
	private isSilent: boolean = false;

	public isStarted: boolean = false;


	/**
	 * Creates a browserRouter instance.
	 *
	 * @returns {BrowserRouter}
	 */
	constructor(router: Router) {
		browserRouter = browserRouter ? browserRouter : this;

		this.router = router;

		return browserRouter;
	}


	/**
	 * Are we at the app root?
	 */
	get isAtRoot(): boolean {
		return this.location && this.location.pathname.replace(/[^\/]$/, '$&/') === this.root && !this.search;
	}


	/**
	 * In IE6, the hash fragment and search params are incorrect if the fragment contains `?`
	 */
	get search(): string {
		let match: Array<string> | null = this.location.href.replace(/#.*/, '').match(/\?.+/);

		return match ? match[0] : '';
	}


	/**
	 * Get the pathname and search params, without the root.
	 */
	get path(): string {
		let path: string = decodeURI(this.location.pathname + this.search);
		let root: string = this.root.slice(0, -1);

		if (!path.indexOf(root)) {
			path = path.slice(root.length);
		}

		return path.replace(ROUTE_STRIPPER, '');
	}


	/**
	 *
	 * Starts the router.
	 * @param {string} options.root
	 * @param {boolean} options.isSilent
	 * @returns {boolean}
	 */
	start({root = '/', isSilent = false}: {root?: string, isSilent?: boolean} = {}): boolean {
		this.root = root;
		this.isSilent = isSilent;
		this.fragment = this.path;

		// Normalize root to always include a leading and trailing slash.
		this.root = `/${this.root}/`.replace(ROOT_STRIPPER, '/');

		$(document).on('scroll', _.debounce(() => {
			this.history.replaceState({
				scroll: $(document).scrollTop()
			}, document.title);
		}, 40));

		window.addEventListener('popstate', this.handlePopState);

		this.history.scrollRestoration = 'manual';
		this.isStarted = true;

		if (!this.isSilent) {
			return this.router.trigger(this.fragment);
		}

		return false;
	}

	handlePopState = () => {
		let current: string = this.path;

		if (current === this.fragment) {
			return false;
		}

		this.router.trigger(current);

		this.fragment = current;

		return true;
	}


	/**
	 * Stops the router.
	 *
	 * @returns {boolean}
	 */
	stop(): boolean {
		// Remove window listeners
		window.removeEventListener('popstate', this.handlePopState);

		this.history.scrollRestoration = 'auto';
		this.isStarted = false;

		return false;
	}


	/**
	 * Updates the URL.
	 * Works iff router is started and the script is running in browser.
	 *
	 * @param {string} fragment
	 * @param {boolean} options.trigger
	 * @param {boolean} options.replace
	 * @returns {boolean}
	 */
	navigate(fragment: string = '', {trigger = true, replace = false, resetScrollPosition = true}: {trigger?: boolean, replace?: boolean, resetScrollPosition?: boolean} = {}): boolean {
		if (!this.isStarted) {
			return false;
		}

		let newFragment = normalizePathFragment(fragment);
		let url = this.root === '/' ? newFragment : this.root + newFragment;

		// Strip the hash and decode for matching.
		newFragment = decodeURI(newFragment.replace(PATH_STRIPPER, ''));

		if (this.fragment === newFragment) {
			return false;
		}

		this.fragment = newFragment;

		// Don't include a trailing slash on the root.
		if (this.fragment === '' && url !== '/') {
			url = url.slice(0, -1);
		}

		// set the fragment as a real URL.
		if (resetScrollPosition) {
			this.history.replaceState({scroll: $(document).scrollTop()}, window.document.title);
			this.history[replace ? 'replaceState' : 'pushState']({scroll: 0}, window.document.title, url);
		} else {
			this.history.replaceState({scroll: $(document).scrollTop()}, window.document.title);
			this.history[replace ? 'replaceState' : 'pushState']({}, window.document.title, url);
		}

		if (trigger) {
			return this.router.trigger(this.fragment);
		}

		return false;
	}
}
