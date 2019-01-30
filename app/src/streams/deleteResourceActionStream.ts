import _ from 'lodash';
import {Stream} from '../libs/ash-utils';


export interface DeleteResourceAction {
	uuid: string;
}

let deleteResourceActionStream: Stream<DeleteResourceAction> = new Stream() as Stream<DeleteResourceAction>;

export default deleteResourceActionStream;
