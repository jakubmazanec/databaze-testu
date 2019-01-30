import { Stream } from '../libs/ash-utils';
export interface ForgottenPasswordAction {
    email: string;
}
declare let forgottenPasswordActionStream: Stream<ForgottenPasswordAction>;
export default forgottenPasswordActionStream;
