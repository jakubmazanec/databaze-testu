import User from './User';
import {ResourceLink} from './Resource';


export interface MethodLink {
	uuid: string;
}

export enum MethodStatus {
	idle = 'IDLE',
	updating = 'UPDATING',
	deleting = 'DELETING'
}

export default interface Method {
	uuid: string;
	owner: User;
	name: string;
	shortName: string | null;
	localName: string | null;
	localShortName: string | null;
	description: string | null;
	tags: Array<string> | null;
	authors: Array<string> | null;
	source: string | null;
	resources: Array<ResourceLink>;
	status: MethodStatus;
}
