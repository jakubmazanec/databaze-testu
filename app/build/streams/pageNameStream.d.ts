import { Stream } from '../libs/ash-utils';
export interface PageNameStreamValue {
    previous: string | null;
    current: string | null;
}
declare let pageNameStream: Stream<PageNameStreamValue>;
export default pageNameStream;
