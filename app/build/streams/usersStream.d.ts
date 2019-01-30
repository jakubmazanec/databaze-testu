import { Stream } from '../libs/ash-utils';
import User, { UserRole } from '../types/User';
export declare enum CurrentUserStatus {
    idle = "IDLE",
    loading = "LOADING",
    error = "ERROR",
    authenticated = "AUTHENTICATED",
}
export interface CurrentUser {
    uuid: string;
    email: string;
    role: UserRole;
    name?: string | null;
    affiliation?: string | null;
    status: CurrentUserStatus;
}
export declare enum UsersStreamStatus {
    idle = "IDLE",
    loading = "LOADING",
}
export interface UsersStreamValue {
    token?: string;
    currentUser?: CurrentUser;
    users: Array<User>;
    status: UsersStreamStatus;
}
declare let usersStream: Stream<UsersStreamValue>;
export default usersStream;
