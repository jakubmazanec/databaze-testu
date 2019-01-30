import {Stream} from '../libs/ash-utils';

import routeStream from './routeStream';


export interface PageStreamValue {
	previous: string | null;
	current: string | null;
}

let pageStream: Stream<PageStreamValue> = new Stream({
	previous: null,
	current: null
});

pageStream.combine((self, changed, dependency) => {
	let value = self.value;
	let {page} = dependency.value;

	if (page !== value.current) {
		let newValue = {
			current: page,
			previous: value.current
		};

		self.push(newValue);
	}
}, routeStream);

export default pageStream;
