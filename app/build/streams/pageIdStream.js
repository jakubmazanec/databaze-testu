import { Stream } from '../libs/ash-utils';
import routeStream from './routeStream';
let pageIdStream = new Stream({
    previous: null,
    current: null
});
pageIdStream.combine((self, changed, dependency) => {
    let value = self.value;
    let { pageId } = dependency.value;
    if (pageId !== value.current) {
        let newValue = {
            current: pageId,
            previous: value.current
        };
        self.push(newValue);
    }
}, routeStream);
export default pageIdStream;