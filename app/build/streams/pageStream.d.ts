import { Stream } from '../libs/ash-utils';
export interface PageStreamValue {
    previous: string | null;
    current: string | null;
}
declare let pageStream: Stream<PageStreamValue>;
export default pageStream;
