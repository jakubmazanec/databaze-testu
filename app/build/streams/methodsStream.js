import $ from 'jquery';
import Bluebird from 'bluebird';
import { Stream } from '../libs/ash-utils';
import _ from 'lodash';
import link from '../utils/link';
import usersStream from './usersStream';
import createMethodActionStream from './createMethodActionStream';
import updateMethodActionStream from './updateMethodActionStream';
import deleteMethodActionStream from './deleteMethodActionStream';
import { MethodStatus } from '../types/Method';
export var MethodsStreamStatus;
(function (MethodsStreamStatus) {
    MethodsStreamStatus["idle"] = "IDLE";
    MethodsStreamStatus["loading"] = "LOADING";
})(MethodsStreamStatus || (MethodsStreamStatus = {}));
let methodsStream = new Stream({
    methods: [],
    status: MethodsStreamStatus.loading
});
methodsStream.name = 'methodsStream';
methodsStream.push((async () => {
    methodsStream.push({ methods: [], status: MethodsStreamStatus.loading });
    let { methods } = methodsStream.value;
    let response;
    try {
        response = await Bluebird.resolve($.ajax({
            url: link('api', 'public'),
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                query: 'query {methods {uuid name shortName localName localShortName description tags authors source owner {uuid name}}}'
            })
        }));
    } catch (error) {
        console.error(error);
    }
    if (!response || response.errors && response.errors.length) {
        return {
            methods,
            status: MethodsStreamStatus.idle
        };
    }
    return {
        methods: response.data.methods.map(method => Object.assign({}, method, { status: MethodStatus.idle })),
        status: MethodsStreamStatus.idle
    };
})());
let cloneMethodsStreamValue = methodsStreamValue => Object.assign({}, methodsStream.value, methodsStreamValue);
let changeMethodStatus = (methods, methodUuid, newStatus) => {
    let methodIndex = _.findIndex(methods, { uuid: methodUuid });
    methods[methodIndex].status = newStatus;
};
methodsStream.combine(async (self, changed) => {
    let newValue = cloneMethodsStreamValue();
    let { token } = usersStream.value;
    let isUpdateNeeded = false;
    if (changed.includes(createMethodActionStream)) {
        isUpdateNeeded = true;
        self.push(cloneMethodsStreamValue({ status: MethodsStreamStatus.loading }));
        let { methods } = methodsStream.value;
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
                    query: 'mutation ($method: CreateMethodInput!) {createMethod(method: $method) {method {uuid name shortName localName localShortName description tags authors source owner {uuid name}}}}',
                    variables: {
                        method: createMethodActionStream.value
                    }
                })
            }));
        } catch (error) {
            console.error(error);
        }
        if (!response || response.errors && response.errors.length) {
            newValue = {
                methods,
                status: MethodsStreamStatus.idle
            };
        } else {
            methods.push(response.data.createMethod.method);
            newValue = {
                methods,
                status: MethodsStreamStatus.idle
            };
        }
    }
    if (changed.includes(updateMethodActionStream)) {
        isUpdateNeeded = true;
        let { methods } = methodsStream.value;
        let response;
        let methodToUpdate = _.clone(updateMethodActionStream.value);
        // optimistically update method and change its status to "updating"
        let methodIndex = _.findIndex(methods, { uuid: methodToUpdate.uuid });
        let oldMethod = _.clone(methods[methodIndex]);
        Object.assign(methods[methodIndex], methodToUpdate, { status: MethodStatus.updating });
        // push new stream value so the UI will update
        self.push(cloneMethodsStreamValue({ methods }));
        try {
            response = await Bluebird.resolve($.ajax({
                url: link('api', 'restricted'),
                type: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                contentType: 'application/json',
                data: JSON.stringify({
                    query: 'mutation ($method: UpdateMethodInput!) {updateMethod(method: $method) {method {uuid name shortName localName localShortName description tags authors source owner {uuid name}}}}',
                    variables: {
                        method: methodToUpdate
                    }
                })
            }));
        } catch (error) {
            console.error(error);
            // revert changes to the method
            Object.assign(methods[methodIndex], oldMethod, { status: MethodStatus.idle });
        }
        if (!response || response.errors && response.errors.length) {
            newValue = {
                methods,
                status: MethodsStreamStatus.idle
            };
        } else {
            let updatedMethod = Object.assign({}, response.data.updateMethod.method, { status: MethodStatus.idle });
            methods[_.findIndex(methods, { uuid: updatedMethod.uuid })] = updatedMethod;
            newValue = {
                methods,
                status: MethodsStreamStatus.idle
            };
        }
    }
    if (changed.includes(deleteMethodActionStream)) {
        isUpdateNeeded = true;
        let { methods } = methodsStream.value;
        let response;
        let methodToDelete = _.clone(deleteMethodActionStream.value);
        // change status of the method to "deleting"
        changeMethodStatus(methods, methodToDelete.uuid, MethodStatus.deleting);
        // push new stream value so the UI will update
        self.push(cloneMethodsStreamValue({ methods }));
        try {
            response = await Bluebird.resolve($.ajax({
                url: link('api', 'restricted'),
                type: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                contentType: 'application/json',
                data: JSON.stringify({
                    query: 'mutation ($method: DeleteMethodInput!) {deleteMethod(method: $method) {method {uuid}}}',
                    variables: {
                        method: methodToDelete
                    }
                })
            }));
        } catch (error) {
            console.error(error);
        }
        if (!response || response.errors && response.errors.length) {
            newValue = {
                methods,
                status: MethodsStreamStatus.idle
            };
        } else {
            _.remove(methods, method => method.uuid === methodToDelete.uuid);
            newValue = {
                methods,
                status: MethodsStreamStatus.idle
            };
        }
    }
    // push new value if needed
    if (isUpdateNeeded) {
        self.push(newValue);
    }
}, createMethodActionStream, updateMethodActionStream, deleteMethodActionStream).immediate();
global.methodsStream = methodsStream;
export default methodsStream;