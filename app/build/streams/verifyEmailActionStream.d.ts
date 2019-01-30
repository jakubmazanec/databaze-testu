import { Stream } from '../libs/ash-utils';
export interface VerifyEmailAction {
    token: string;
}
declare let verifyEmailActionStream: Stream<VerifyEmailAction>;
export default verifyEmailActionStream;
