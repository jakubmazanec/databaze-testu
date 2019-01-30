import { Stream } from '../libs/ash-utils';
export interface LoginAction {
    email: string;
    password: string;
}
declare let loginActionStream: Stream<LoginAction>;
export default loginActionStream;
