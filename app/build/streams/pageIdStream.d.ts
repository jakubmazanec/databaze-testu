import { Stream } from '../libs/ash-utils';
export interface PageIdStreamValue {
    previous: string | null;
    current: string | null;
}
declare let pageIdStream: Stream<PageIdStreamValue>;
export default pageIdStream;
