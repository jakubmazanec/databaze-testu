import $ from 'jquery';
import Bluebird from 'bluebird';
import jwt from 'jwt-decode';
import _ from 'lodash';
import { Stream, localStore } from '../libs/ash-utils';
import browserRouter from './browserRouter';
import loginActionStream from './loginActionStream';
import logoutActionStream from './logoutActionStream';
import signupActionStream from './signupActionStream';
import verifyEmailActionStream from './verifyEmailActionStream';
import forgottenPasswordActionStream from './forgottenPasswordActionStream';
import resetPasswordActionStream from './resetPasswordActionStream';
import updateUserActionStream from './updateUserActionStream';
import link from '../utils/link';
import { UserStatus } from '../types/User';
export var CurrentUserStatus;
(function (CurrentUserStatus) {
    CurrentUserStatus["idle"] = "IDLE";
    CurrentUserStatus["loading"] = "LOADING";
    CurrentUserStatus["error"] = "ERROR";
    CurrentUserStatus["authenticated"] = "AUTHENTICATED";
})(CurrentUserStatus || (CurrentUserStatus = {}));
export var UsersStreamStatus;
(function (UsersStreamStatus) {
    UsersStreamStatus["idle"] = "IDLE";
    UsersStreamStatus["loading"] = "LOADING";
})(UsersStreamStatus || (UsersStreamStatus = {}));
let savedUser = localStore.get('login');
let initialUsersStreamValue = {
    users: [],
    status: UsersStreamStatus.idle
};
if (savedUser) {
    initialUsersStreamValue.token = savedUser.token;
    initialUsersStreamValue.currentUser = savedUser.currentUser;
    if (savedUser.currentUser) {
        savedUser.currentUser.status = CurrentUserStatus.authenticated;
    }
}
let usersStream = new Stream(initialUsersStreamValue);
let getUsers = async token => {
    let { token: usersStreamToken } = usersStream.value;
    let users = [];
    let response;
    if (!token || usersStreamToken) {
        return users;
    }
    try {
        response = await Bluebird.resolve($.ajax({
            url: link('api', 'restricted'),
            type: 'POST',
            headers: {
                Authorization: `Bearer ${usersStreamToken || token}`
            },
            contentType: 'application/json',
            data: JSON.stringify({
                query: 'query {users {uuid email role name affiliation}}'
            })
        }));
    } catch (error) {
        console.error(error);
    }
    if (!response || response.errors && response.errors.length) {
        return users;
    }
    return response.data.users.map(user => Object.assign({}, user, { status: UserStatus.idle }));
};
if (usersStream.value.token) {
    usersStream.push((async () => {
        usersStream.push(Object.assign({}, usersStream.value, { status: UsersStreamStatus.loading }));
        let users = await getUsers();
        return Object.assign({}, usersStream.value, { users, status: UsersStreamStatus.idle });
    })());
}
usersStream.combine(async (self, changed) => {
    let newValue = Object.assign({}, usersStream.value);
    let { token } = usersStream.value;
    let isUpdateNeeded = false;
    if (changed.includes(loginActionStream)) {
        isUpdateNeeded = true;
        self.push(Object.assign({}, newValue, { status: UsersStreamStatus.loading }));
        let { email, password } = loginActionStream.value;
        let response;
        try {
            response = await Bluebird.resolve($.ajax({
                url: link('api', 'public'),
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    query: 'query ($email: Email!, $password: String!) {token(email: $email, password: $password)}',
                    variables: { email, password }
                })
            }));
        } catch (error) {
            console.error(error);
        }
        if (!response || response.errors && response.errors.length) {
            newValue = Object.assign({}, newValue, { status: UsersStreamStatus.idle });
        } else {
            let { token: newToken } = response.data;
            let { uuid, role } = jwt(newToken);
            let currentUser = {
                uuid,
                email,
                role,
                status: CurrentUserStatus.authenticated
            };
            let users = await getUsers(newToken);
            localStore.set('login', { token: newToken, currentUser: { uuid, email, role } });
            newValue = Object.assign({}, newValue, { users, token: newToken, currentUser, status: UsersStreamStatus.idle });
            browserRouter.navigate(link());
        }
    }
    if (changed.includes(logoutActionStream)) {
        isUpdateNeeded = true;
        localStore.remove('login');
        newValue = Object.assign({}, newValue, { users: [], token: undefined, currentUser: undefined, status: UsersStreamStatus.idle });
    }
    if (changed.includes(signupActionStream)) {
        self.push(Object.assign({}, newValue, { status: UsersStreamStatus.loading }));
        let { email, password } = signupActionStream.value;
        let response;
        try {
            response = await Bluebird.resolve($.ajax({
                url: link('api', 'public'),
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    query: 'mutation ($user: CreateUserInput!) {createUser(user: $user) {user {uuid}}}',
                    variables: {
                        user: { email, password }
                    }
                })
            }));
        } catch (error) {
            console.error(error);
        }
        if (!response || response.errors && response.errors.length) {} else {
            console.log(response.data);
        }
        self.push(Object.assign({}, newValue, { status: UsersStreamStatus.idle }));
    }
    if (changed.includes(verifyEmailActionStream)) {
        self.push(Object.assign({}, newValue, { status: UsersStreamStatus.loading }));
        let { token } = verifyEmailActionStream.value;
        let response;
        try {
            response = await Bluebird.resolve($.ajax({
                url: link('api', 'restricted'),
                type: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                contentType: 'application/json',
                data: JSON.stringify({
                    query: 'mutation {verifyEmail {isVerified}}'
                })
            }));
        } catch (error) {
            console.error(error);
        }
        if (!response || response.errors && response.errors.length) {} else {
            // console.log(response.data);
        }
        self.push(Object.assign({}, newValue, { status: UsersStreamStatus.idle }));
    }
    if (changed.includes(forgottenPasswordActionStream)) {
        self.push(Object.assign({}, newValue, { status: UsersStreamStatus.loading }));
        let { email } = forgottenPasswordActionStream.value;
        let response;
        try {
            response = await Bluebird.resolve($.ajax({
                url: link('api', 'public'),
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    query: 'mutation ($email: Email!) {resetPassword(email: $email)}',
                    variables: {
                        email
                    }
                })
            }));
        } catch (error) {
            console.error(error);
        }
        if (!response || response.errors && response.errors.length) {} else {
            console.log(response.data);
        }
        self.push(Object.assign({}, newValue, { status: UsersStreamStatus.idle }));
    }
    if (changed.includes(resetPasswordActionStream)) {
        self.push(Object.assign({}, newValue, { status: UsersStreamStatus.loading }));
        let { password, token } = resetPasswordActionStream.value;
        let response;
        try {
            response = await Bluebird.resolve($.ajax({
                url: link('api', 'restricted'),
                type: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                contentType: 'application/json',
                data: JSON.stringify({
                    query: 'mutation ($password: String!) {resetPassword(password: $password) {isReset}}',
                    variables: {
                        password
                    }
                })
            }));
        } catch (error) {
            console.error(error);
        }
        if (!response || response.errors && response.errors.length) {} else {
            // console.log(response.data);
        }
        self.push(Object.assign({}, newValue, { status: UsersStreamStatus.idle }));
    }
    if (changed.includes(updateUserActionStream)) {
        isUpdateNeeded = true;
        let { users } = newValue;
        let response;
        let userToUpdate = _.clone(updateUserActionStream.value);
        // optimistically update user and change its status to "updating"
        let userIndex = _.findIndex(users, { uuid: userToUpdate.uuid });
        let oldUser = _.clone(users[userIndex]);
        users[userIndex] = Object.assign({}, users[userIndex], { name: userToUpdate.name === undefined ? users[userIndex].name : userToUpdate.name, affiliation: userToUpdate.affiliation === undefined ? users[userIndex].affiliation : userToUpdate.affiliation, status: UserStatus.updating });
        // push new stream value so the UI will update
        self.push(Object.assign({}, newValue, { users }));
        try {
            response = await Bluebird.resolve($.ajax({
                url: link('api', 'restricted'),
                type: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                contentType: 'application/json',
                data: JSON.stringify({
                    query: 'mutation ($user: UpdateUserInput!) {updateUser(user: $user) {user {uuid email role name affiliation}}}',
                    variables: {
                        user: userToUpdate
                    }
                })
            }));
        } catch (error) {
            console.error(error);
            // revert changes to the user
            users[userIndex] = Object.assign({}, oldUser, { status: UserStatus.idle });
        }
        if (!response || response.errors && response.errors.length) {
            newValue = Object.assign({}, newValue, { users, status: UsersStreamStatus.idle });
        } else {
            let updatedUser = Object.assign({}, response.data.updateUser.user, { status: UserStatus.idle });
            users[_.findIndex(users, { uuid: updatedUser.uuid })] = updatedUser;
            newValue = Object.assign({}, newValue, { users, status: UsersStreamStatus.idle });
        }
    }
    if (newValue.currentUser) {
        let currentUserIndex = _.findIndex(newValue.users, { uuid: newValue.currentUser.uuid });
        if (currentUserIndex >= 0) {
            newValue.currentUser = Object.assign({}, newValue.currentUser, { name: newValue.users[currentUserIndex].name, affiliation: newValue.users[currentUserIndex].affiliation });
        }
    }
    if (isUpdateNeeded) {
        self.push(newValue);
    }
}, loginActionStream, logoutActionStream, signupActionStream, verifyEmailActionStream, forgottenPasswordActionStream, resetPasswordActionStream, updateUserActionStream).immediate();
global.usersStream = usersStream;
export default usersStream;