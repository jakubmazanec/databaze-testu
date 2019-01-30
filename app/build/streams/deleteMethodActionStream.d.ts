import { Stream } from '../libs/ash-utils';
export interface DeleteMethodAction {
    uuid: string;
}
declare let deleteMethodActionStream: Stream<DeleteMethodAction>;
export default deleteMethodActionStream;
