import {Stream} from '../libs/ash-utils';


export interface ForgottenPasswordAction {
	email: string;
}

let forgottenPasswordActionStream: Stream<ForgottenPasswordAction> = new Stream() as Stream<ForgottenPasswordAction>;

export default forgottenPasswordActionStream;
