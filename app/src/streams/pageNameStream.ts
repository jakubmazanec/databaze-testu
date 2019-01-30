import {Stream} from '../libs/ash-utils';

import routeStream from './routeStream';


export interface PageNameStreamValue {
	previous: string | null;
	current: string | null;
}

let pageNameStream: Stream<PageNameStreamValue> = new Stream({
	previous: null,
	current: null
});

pageNameStream.combine((self, changed, dependency) => {
	let value = self.value;
	let {pageName} = dependency.value;

	if (pageName !== value.current) {
		let newValue = {
			current: pageName,
			previous: value.current
		};

		self.push(newValue);
	}
}, routeStream);

export default pageNameStream;
