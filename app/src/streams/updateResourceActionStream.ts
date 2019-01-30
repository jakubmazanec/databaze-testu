import _ from 'lodash';
import {Stream} from '../libs/ash-utils';

import {ResourceType} from '../types/Resource';


export interface UpdateMethodAction {
	uuid: string;
	name?: string;
	type?: ResourceType;
	description?: string | null;
}

let updateMethodActionStream: Stream<UpdateMethodAction> = new Stream() as Stream<UpdateMethodAction>;

export default updateMethodActionStream;
