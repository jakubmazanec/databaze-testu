import { Stream } from '../libs/ash-utils';
import routeStream from './routeStream';
let pageNameStream = new Stream({
    previous: null,
    current: null
});
pageNameStream.combine((self, changed, dependency) => {
    let value = self.value;
    let { pageName } = dependency.value;
    if (pageName !== value.current) {
        let newValue = {
            current: pageName,
            previous: value.current
        };
        self.push(newValue);
    }
}, routeStream);
export default pageNameStream;