import {Stream} from '../libs/ash-utils';


export interface SignupAction {
	email: string;
	password: string;
}

let signupActionStream: Stream<SignupAction> = new Stream() as Stream<SignupAction>;

export default signupActionStream;
