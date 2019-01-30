import {Stream} from '../libs/ash-utils';


export interface VerifyEmailAction {
	token: string;
}

let verifyEmailActionStream: Stream<VerifyEmailAction> = new Stream() as Stream<VerifyEmailAction>;

export default verifyEmailActionStream;
