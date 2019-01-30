export var UserStatus;
(function (UserStatus) {
    UserStatus["idle"] = "IDLE";
    UserStatus["updating"] = "UPDATING";
    UserStatus["deleting"] = "DELETING";
})(UserStatus || (UserStatus = {}));
export var UserRole;
(function (UserRole) {
    UserRole["guest"] = "GUEST";
    UserRole["user"] = "USER";
    UserRole["admin"] = "ADMIN";
})(UserRole || (UserRole = {}));