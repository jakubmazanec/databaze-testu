import { Stream } from '../libs/ash-utils';
import { ResourceType } from '../types/Resource';
export interface UpdateMethodAction {
    uuid: string;
    name?: string;
    type?: ResourceType;
    description?: string | null;
}
declare let updateMethodActionStream: Stream<UpdateMethodAction>;
export default updateMethodActionStream;
