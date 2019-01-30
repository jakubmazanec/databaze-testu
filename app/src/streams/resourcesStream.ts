import $ from 'jquery';
import Bluebird from 'bluebird';
import jwt from 'jwt-decode';
import {Stream} from '../libs/ash-utils';
import _ from 'lodash';

import link from '../utils/link';
import usersStream from './usersStream';
import createResourceActionStream from './createResourceActionStream';
import updateResourceActionStream from './updateResourceActionStream';
import deleteResourceActionStream from './deleteResourceActionStream';
import Resource, {ResourceStatus} from '../types/Resource';


export enum ResourcesStreamStatus {
	idle = 'IDLE',
	loading = 'LOADING'
}

export interface ResourcesStreamValue {
	resources: Array<Resource>;
	status: ResourcesStreamStatus;
}

let resourcesStream: Stream<ResourcesStreamValue> = new Stream({
	resources: [],
	status: ResourcesStreamStatus.loading
});

resourcesStream.name = 'resourcesStream';

resourcesStream.push((async () => {
	resourcesStream.push({resources: [], status: ResourcesStreamStatus.loading});

	let {resources} = resourcesStream.value;
	let response;

	try {
		response = await Bluebird.resolve($.ajax({
			url: link('api', 'public'),
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({
				query: 'query {resources {uuid type name description owner {uuid name} method {uuid}}}'
			})
		}));
	} catch (error) {
		console.error(error);
	}

	if (!response || response.errors && response.errors.length) {
		return {
			resources,
			status: ResourcesStreamStatus.idle
		};
	}

	return {
		resources: response.data.resources.map((resource: Resource) => ({...resource, status: ResourceStatus.idle})),
		status: ResourcesStreamStatus.idle
	};
})());

let cloneResourcesStreamValue = (resourcesStreamValue?: {}): ResourcesStreamValue => Object.assign({}, resourcesStream.value, resourcesStreamValue);
let changeResourceStatus = (resources: Array<Resource>, resourceUuid: string, newStatus: ResourceStatus) => {
	let resourceIndex = _.findIndex(resources, {uuid: resourceUuid});

	resources[resourceIndex].status = newStatus;
};

resourcesStream.combine(async (self, changed) => {
	let newValue = cloneResourcesStreamValue();
	let {token} = usersStream.value;
	let isUpdateNeeded = false;

	if (changed.includes(createResourceActionStream)) {
		isUpdateNeeded = true;

		self.push(cloneResourcesStreamValue({status: ResourcesStreamStatus.loading}));

		let {resources} = resourcesStream.value;
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
					query: 'mutation ($resource: CreateResourceInput!) {createResource(resource: $resource) {resource {uuid type name description owner {uuid name} method {uuid}}}}',
					variables: {
						resource: createResourceActionStream.value
					}
				})
			}));
		} catch (error) {
			console.error(error);
		}

		if (!response || response.errors && response.errors.length) {
			newValue = {
				resources,
				status: ResourcesStreamStatus.idle
			};
		} else {
			resources.push(response.data.createResource.resource);

			newValue = {
				resources,
				status: ResourcesStreamStatus.idle
			};
		}
	}

	if (changed.includes(updateResourceActionStream)) {
		isUpdateNeeded = true;

		let {resources} = resourcesStream.value;
		let response;
		let resourceToUpdate = _.clone(updateResourceActionStream.value);

		// optimistically update resource and change its status to "updating"
		let resourceIndex = _.findIndex(resources, {uuid: resourceToUpdate.uuid});
		let oldResource = _.clone(resources[resourceIndex]);
		Object.assign(resources[resourceIndex], resourceToUpdate, {status: ResourceStatus.updating});

		// push new stream value so the UI will update
		self.push(cloneResourcesStreamValue({resources}));

		try {
			response = await Bluebird.resolve($.ajax({
				url: link('api', 'restricted'),
				type: 'POST',
				headers: {
					Authorization: `Bearer ${token}`
				},
				contentType: 'application/json',
				data: JSON.stringify({
					query: 'mutation ($resource: UpdateResourceInput!) {updateResource(resource: $resource) {resource {uuid type name description owner {uuid name} method {uuid}}}}',
					variables: {
						resource: resourceToUpdate
					}
				})
			}));
		} catch (error) {
			console.error(error);

			// revert changes to the resource
			Object.assign(resources[resourceIndex], oldResource, {status: ResourceStatus.idle});
		}

		if (!response || response.errors && response.errors.length) {
			newValue = {
				resources,
				status: ResourcesStreamStatus.idle
			};
		} else {
			let updatedResource = {...response.data.updateResource.resource, status: ResourceStatus.idle};

			resources[_.findIndex(resources, {uuid: updatedResource.uuid})] = updatedResource;
			newValue = {
				resources,
				status: ResourcesStreamStatus.idle
			};
		}
	}

	if (changed.includes(deleteResourceActionStream)) {
		isUpdateNeeded = true;

		let {resources} = resourcesStream.value;
		let response;
		let reourceToDelete = _.clone(deleteResourceActionStream.value);

		// change status of the resource to "deleting"
		changeResourceStatus(resources, reourceToDelete.uuid, ResourceStatus.deleting);

		// push new stream value so the UI will update
		self.push(cloneResourcesStreamValue({resources}));

		try {
			response = await Bluebird.resolve($.ajax({
				url: link('api', 'restricted'),
				type: 'POST',
				headers: {
					Authorization: `Bearer ${token}`
				},
				contentType: 'application/json',
				data: JSON.stringify({
					query: 'mutation ($resource: DeleteResourceInput!) {deleteResource(resource: $resource) {resource {uuid}}}',
					variables: {
						resource: reourceToDelete
					}
				})
			}));
		} catch (error) {
			console.error(error);
		}

		if (!response || response.errors && response.errors.length) {
			newValue = {
				resources,
				status: ResourcesStreamStatus.idle
			};
		} else {
			_.remove(resources, (resource) => resource.uuid === reourceToDelete.uuid);

			newValue = {
				resources,
				status: ResourcesStreamStatus.idle
			};
		}
	}

	// push new value if needed
	if (isUpdateNeeded) {
		self.push(newValue);
	}
}, createResourceActionStream, updateResourceActionStream, deleteResourceActionStream).immediate();

(global as any).resourcesStream = resourcesStream;

export default resourcesStream;
