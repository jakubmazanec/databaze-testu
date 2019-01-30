import { Stream } from '../libs/ash-utils';
export interface DeleteResourceAction {
    uuid: string;
}
declare let deleteResourceActionStream: Stream<DeleteResourceAction>;
export default deleteResourceActionStream;
