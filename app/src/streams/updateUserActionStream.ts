import _ from 'lodash';
import {Stream} from '../libs/ash-utils';


export interface UpdateUserAction {
	uuid: string;
	password?: string;
	name?: string | null;
	affiliation?: string | null;
}

let updateUserActionStream: Stream<UpdateUserAction> = new Stream() as Stream<UpdateUserAction>;

export default updateUserActionStream;
