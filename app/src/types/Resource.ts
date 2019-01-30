import User from './User';
import {MethodLink} from './Method';


export interface ResourceLink {
	uuid: string;
}

export enum ResourceStatus {
	idle = 'IDLE',
	updating = 'UPDATING',
	deleting = 'DELETING'
}

export enum ResourceType {
	original = 'ORIGINAL',
	translation = 'TRANSLATION',
	data = 'DATA',
	standards = 'STANDARDS',
	scripts = 'SCRIPTS',
	study = 'STUDY',
	declaration = 'DECLARATION',
	patronage = 'PATRONAGE'
}

export default interface Resource {
	uuid: string;
	type: ResourceType;
	name: string;
	description: string | null;
	method?: MethodLink;
	owner: User;
	status: ResourceStatus;
}
