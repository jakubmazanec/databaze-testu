import { Stream } from '../libs/ash-utils';
import routeStream from './routeStream';
let pageStream = new Stream({
    previous: null,
    current: null
});
pageStream.combine((self, changed, dependency) => {
    let value = self.value;
    let { page } = dependency.value;
    if (page !== value.current) {
        let newValue = {
            current: page,
            previous: value.current
        };
        self.push(newValue);
    }
}, routeStream);
export default pageStream;