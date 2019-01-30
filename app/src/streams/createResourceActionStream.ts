import _ from 'lodash';
import {Stream} from '../libs/ash-utils';

import {ResourceType} from '../types/Resource';


export interface CreateResourceAction {
	methodUuid: string;
	type: ResourceType;
	name: string;
	description: string | null;
}

let createResourceActionStream: Stream<CreateResourceAction> = new Stream() as Stream<CreateResourceAction>;

export default createResourceActionStream;
