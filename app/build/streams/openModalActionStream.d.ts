import { Stream } from '../libs/ash-utils';
import { OpenModal } from '../types/AppState';
export interface OpenModalAction {
    modal: OpenModal;
    parameter?: string;
}
declare let openModalActionStream: Stream<OpenModalAction>;
export default openModalActionStream;
