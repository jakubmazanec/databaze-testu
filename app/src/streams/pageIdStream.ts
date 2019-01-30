import {Stream} from '../libs/ash-utils';

import routeStream from './routeStream';


export interface PageIdStreamValue {
	previous: string | null;
	current: string | null;
}

let pageIdStream: Stream<PageIdStreamValue> = new Stream({
	previous: null,
	current: null
});

pageIdStream.combine((self, changed, dependency) => {
	let value = self.value;
	let {pageId} = dependency.value;

	if (pageId !== value.current) {
		let newValue = {
			current: pageId,
			previous: value.current
		};

		self.push(newValue);
	}
}, routeStream);

export default pageIdStream;
