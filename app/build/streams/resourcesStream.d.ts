import { Stream } from '../libs/ash-utils';
import Resource from '../types/Resource';
export declare enum ResourcesStreamStatus {
    idle = "IDLE",
    loading = "LOADING",
}
export interface ResourcesStreamValue {
    resources: Array<Resource>;
    status: ResourcesStreamStatus;
}
declare let resourcesStream: Stream<ResourcesStreamValue>;
export default resourcesStream;
