import {Stream} from '../libs/ash-utils';


export interface LoginAction {
	email: string;
	password: string;
}

let loginActionStream: Stream<LoginAction> = new Stream() as Stream<LoginAction>;

export default loginActionStream;
