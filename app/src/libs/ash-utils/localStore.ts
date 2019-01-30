// common 5MB local storage limit among current browsers
let defaultSize = 5242880;

export class LocalStore {
	// Removes all key/value pairs from localStorage
	clear() {
		window.localStorage.clear();
	}

	// Checks if localStorage contains the specified key
	contains(key: string) {
		if (typeof key !== 'string') {
			throw new Error('Key must be a string for function contains(key)');
		}

		return this.keys().includes(key);
	}

	// Returns an array of keys currently stored in localStorage
	keys() {
		let keys: Array<string> = [];

		for (let i = 0; i < window.localStorage.length; i++) {
			keys.push(window.localStorage[i]);
		}

		return keys;
	}

	// Returns the value of a specified key in localStorage
	// The value is converted to the proper type upon retrieval
	// If the key is not in local storage and the defaultValue is specified, the default value is returned.
	get(key: string, defaultValue?: any) {
		if (typeof key === 'undefined') {
			let value: {[key: string]: any} = {};
			let keys = this.keys();

			for (let i = 0; i < keys.length; i++) {
				value[keys[i]] = this.get(keys[i]);
			}

			return value;
		}

		if (typeof key !== 'string') {
			throw new Error('Key must be a string for function get(key)');
		}

		let value = window.localStorage.getItem(key); // retrieve value
		let number = value ? parseFloat(value) : NaN; // to allow for number checking

		if (value === null) {
		// Returns default value if key is not set, otherwise returns null
			return arguments.length === 2 ? defaultValue : null;
		} else if (!isNaN(number)) {
			return number; // value was of type number
		} else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
			return value === 'true'; //value was of type boolean
		}

		try {
			value = JSON.parse(value);

			return value;
		} catch (error) {
			return value;
		}
	}

	// Returns how much space is left in localStorage
	// The most common limit for browsers today is 5MB, as specified by default size
	// IE8+ has a properly implemented remainingSpace property which is used if
	// possible, otherwise it is approximated by subtracting the defaultSize with
	// the total size of all the strings in localStorage
	getRemainingSpace() {
		return defaultSize - this.getSize();
	}

	// Returns the size of the total contents in localStorage
	getSize() {
		return JSON.stringify(window.localStorage).length;
	}

	// Returns true if localStorage has no key/value pairs
	isEmpty() {
		return this.keys().length === 0;
	}

	// Removes the specified key/value pair from localStorage given a key
	// Optionally takes an array to remove key/value pairs specified in the array
	remove(key: string | Array<string>) {
		if (typeof key === 'string') {
			window.localStorage.removeItem(key);
		} else if (key instanceof Array) {
			for (let i = 0; i < key.length; i++) {
				if (typeof key[i] === 'string') {
					window.localStorage.removeItem(key[i]);
				} else {
					throw new Error(`Key in index ${i} is not a string`);
				}
			}
		} else {
			throw new Error('Key must be a string or array for function remove(key || array)');
		}
	}

	// Stores the specified key value pair (allows string, number, boolean, object, array)
	// If no key and only an object is passed, this function acts as an alias function for store(object)
	set(key: string, value: any) {
		let newValue = value;

		if (typeof key === 'string') {
			if (typeof newValue === 'object') {
				newValue = JSON.stringify(newValue);
			}

			window.localStorage.setItem(key, newValue);
		}
	}
}

export default new LocalStore();
