import { Stream } from '../libs/ash-utils';
import Method from '../types/Method';
export declare enum MethodsStreamStatus {
    idle = "IDLE",
    loading = "LOADING",
}
export interface MethodsStreamValue {
    methods: Array<Method>;
    status: MethodsStreamStatus;
}
declare let methodsStream: Stream<MethodsStreamValue>;
export default methodsStream;
