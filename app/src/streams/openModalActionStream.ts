import {Stream} from '../libs/ash-utils';

import {OpenModal} from '../types/AppState';

export interface OpenModalAction {
	modal: OpenModal;
	parameter?: string;
}

let openModalActionStream: Stream<OpenModalAction> = new Stream() as Stream<OpenModalAction>;

export default openModalActionStream;
