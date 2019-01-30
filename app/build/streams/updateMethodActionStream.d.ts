import { Stream } from '../libs/ash-utils';
export interface UpdateMethodAction {
    uuid: string;
    name?: string;
    shortName?: string | null;
    localName?: string | null;
    localShortName?: string | null;
    description?: string | null;
    tags?: Array<string> | null;
    authors?: Array<string> | null;
    source?: string | null;
}
declare let updateMethodActionStream: Stream<UpdateMethodAction>;
export default updateMethodActionStream;
