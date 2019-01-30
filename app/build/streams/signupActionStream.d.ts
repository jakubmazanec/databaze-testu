import { Stream } from '../libs/ash-utils';
export interface SignupAction {
    email: string;
    password: string;
}
declare let signupActionStream: Stream<SignupAction>;
export default signupActionStream;
