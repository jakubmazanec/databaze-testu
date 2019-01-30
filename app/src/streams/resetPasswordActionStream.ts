import {Stream} from '../libs/ash-utils';


export interface ResetPasswordAction {
	password: string;
	token: string;
}

let resetPasswordActionStream: Stream<ResetPasswordAction> = new Stream() as Stream<ResetPasswordAction>;

export default resetPasswordActionStream;
