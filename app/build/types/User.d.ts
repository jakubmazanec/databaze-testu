export declare enum UserStatus {
    idle = "IDLE",
    updating = "UPDATING",
    deleting = "DELETING",
}
export declare enum UserRole {
    guest = "GUEST",
    user = "USER",
    admin = "ADMIN",
}
export default interface User {
    uuid: string;
    email: string;
    role: UserRole;
    name: string | null;
    affiliation: string | null;
    status: UserStatus;
}
