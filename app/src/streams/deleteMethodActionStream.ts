import _ from 'lodash';
import {Stream} from '../libs/ash-utils';


export interface DeleteMethodAction {
	uuid: string;
}

let deleteMethodActionStream: Stream<DeleteMethodAction> = new Stream() as Stream<DeleteMethodAction>;

export default deleteMethodActionStream;
