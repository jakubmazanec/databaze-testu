import constants from './constants';


const CLIENT_PLATFORM = constants.CLIENT_PLATFORM;
const SERVER_PLATFORM = constants.SERVER_PLATFORM;


/**
 * An object environment feature flags.
 */
let support: {
	platform?: string
} = {};


/**
 * Returns string based on the platform (ie. server or client) ash is running on.
 */
support.platform = typeof exports !== 'undefined' && typeof global.process === 'object' ? SERVER_PLATFORM : CLIENT_PLATFORM;

export default support;
