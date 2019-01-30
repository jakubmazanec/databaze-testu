import { Stream } from '../libs/ash-utils';
export interface UpdateUserAction {
    uuid: string;
    password?: string;
    name?: string | null;
    affiliation?: string | null;
}
declare let updateUserActionStream: Stream<UpdateUserAction>;
export default updateUserActionStream;
