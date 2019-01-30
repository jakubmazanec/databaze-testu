import { Stream } from '../libs/ash-utils';
export interface LanguageStreamValue {
    previous: string | null;
    current: string | null;
}
declare let languageStram: Stream<LanguageStreamValue>;
export default languageStram;
