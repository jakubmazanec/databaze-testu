import _ from 'lodash';
import {Stream} from '../libs/ash-utils';


export interface CreateMethodAction {
	name: string;
	shortName: string | null;
	localName: string | null;
	localShortName: string | null;
	description: string | null;
	tags: Array<string> | null;
	authors: Array<string> | null;
	source: string | null;
}

let createMethodActionStream: Stream<CreateMethodAction> = new Stream() as Stream<CreateMethodAction>;

export default createMethodActionStream;
