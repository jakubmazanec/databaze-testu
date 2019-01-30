import { Stream } from '../libs/ash-utils';
export interface ResetPasswordAction {
    password: string;
    token: string;
}
declare let resetPasswordActionStream: Stream<ResetPasswordAction>;
export default resetPasswordActionStream;
