import { Stream } from '../libs/ash-utils';
import { ResourceType } from '../types/Resource';
export interface CreateResourceAction {
    methodUuid: string;
    type: ResourceType;
    name: string;
    description: string | null;
}
declare let createResourceActionStream: Stream<CreateResourceAction>;
export default createResourceActionStream;
