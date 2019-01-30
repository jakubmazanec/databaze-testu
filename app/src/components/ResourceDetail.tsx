import Inferno from 'inferno';
import Component from 'inferno-component';
import {I18n, Stream} from '../libs/ash-utils';
import _ from 'lodash';
import {Button, Spinner, Input, RadioButton, tableStyles} from '../libs/ash-components';

import browserRouter from '../streams/browserRouter';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import usersStream from '../streams/usersStream';
import methodsStream, {MethodsStreamStatus} from '../streams/methodsStream';
import resourcesStream, {ResourcesStreamStatus} from '../streams/resourcesStream';
import updateResourceActionStream from '../streams/updateResourceActionStream';
import deleteResourceActionStream from '../streams/deleteResourceActionStream';
import openModalActionStream from '../streams/openModalActionStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import {UserRole} from '../types/User';
import Method, {MethodStatus} from '../types/Method';
import Resource, {ResourceStatus, ResourceType} from '../types/Resource';
import {OpenModal} from '../types/AppState';
import styles from './ResourceDetail.css';


const SPLIT_REGEXP = /\s*[,;]\s*/;

let i18n = new I18n();

let getResourceTypeLabel = (type: ResourceType) => {
	if (type === ResourceType.original) {
		return 'Original method';
	} else if (type === ResourceType.translation) {
		return 'Translation';
	} else if (type === ResourceType.data) {
		return 'Data';
	} else if (type === ResourceType.standards) {
		return 'Standards';
	} else if (type === ResourceType.scripts) {
		return 'Scripts';
	} else if (type === ResourceType.study) {
		return 'Study or report';
	} else if (type === ResourceType.declaration) {
		return 'Declaration of work being done';
	} else if (type === ResourceType.patronage) {
		return 'Paronage of the method';
	}

	return '?';
};

export interface ResourceDetailProps {
	resource: Resource | null;
}

export default class ResourceDetail extends Component<ResourceDetailProps, {}> {
	state = {
		isEditingModeOn: false,
		isWaitingForResponse: false,
		isDoneMessageVisible: false,
		type: this.props.resource && this.props.resource.type ? this.props.resource.type : ResourceType.original,
		name: this.props.resource && this.props.resource.name ? this.props.resource.name : '',
		description: this.props.resource && this.props.resource.description ? this.props.resource.description : ''
	};

	private onAppStateStream: Stream<{}>;
	private onLanguageStream: Stream<{}>;
	private onUsersStream: Stream<{}>;
	private onMethodsStream: Stream<{}>;
	private onResourcesStream: Stream<{}>;

	componentDidMount() {
		this.onAppStateStream = appStateStream.subscribe(() => this.forceUpdate());
		this.onLanguageStream = languageStream.subscribe(() => this.forceUpdate());
		this.onUsersStream = languageStream.subscribe(() => this.forceUpdate());
		this.onMethodsStream = methodsStream.subscribe(() => this.forceUpdate());
		this.onResourcesStream = resourcesStream.subscribe(() => {
			let {resource} = this.props;

			if (resource) {
				let {resources} = resourcesStream.value;
				let resourceIndex = _.findIndex(resources, {uuid: resource.uuid});

				if (this.state.isWaitingForResponse && resources[resourceIndex].status === ResourceStatus.idle) {
					this.setState({
						isWaitingForResponse: false,
						isDoneMessageVisible: true
					});
				} else {
					this.forceUpdate();
				}
			} else {
				this.forceUpdate();
			}
		});
	}

	componentDidUnmount() {
		this.onAppStateStream.end();
		this.onLanguageStream.end();
		this.onUsersStream.end();
		this.onMethodsStream.end();
		this.onResourcesStream.end();
	}

	render() {
		let {currentUser} = usersStream.value;
		let {methods} = methodsStream.value;
		let {resources, status: resourcesStreamStatus} = resourcesStream.value;
		let {resource} = this.props;

		if (!resource) {
			return resourcesStreamStatus === ResourcesStreamStatus.loading ? <main className={styles.root}>
				<div className={styles.fallbackContent}>
					<Spinner isVisible={true} />
				</div>
			</main> : <main className={styles.root}>
				<div className={styles.fallbackContent}>
					<p>Sorry, we can’t find this resource.</p>
				</div>
			</main>;
		}

		// let method = _.find(methods, {uuid: resource.method.uuid});

		return <main className={styles.root}>
			<h2 className={styles.heading}>
				{this.state.isEditingModeOn ? <Input name="name" value={this.state.name} onChange={this.handleNameChange} /> : `${resource.name}`}
			</h2>

			<div className={styles.row}>
				<div className={styles.doubleRowItem}>
					<h4 className={styles.attributeHeading}>Type</h4>
					<p className={resource.type ? '' : styles.isUnknown}>
						{this.state.isEditingModeOn ? <RadioButton name="type" items={Object.values(ResourceType).map((type) => ({
							value: type,
							label: getResourceTypeLabel(type as ResourceType),
							isChecked: this.state.type === type,
							isDisabled: false
						}))} onChange={this.handleTypeChange} /> : (resource.type ? `${getResourceTypeLabel(resource.type)}` : '?')}
					</p>
				</div>
			</div>

			<div className={styles.row}>
				<div className={styles.wideRowItem}>
					<h4 className={styles.attributeHeading}>Description</h4>
					<p className={`${resource.description ? '' : styles.isUnknown} ${this.state.isEditingModeOn ? styles.isBeingEdited : ''}`}>
						{this.state.isEditingModeOn ? <Input name="description" value={this.state.description} onChange={this.handleDescriptionChange} /> : (resource.description ? `${resource.description}` : '?')}
					</p>
				</div>
			</div>

			{currentUser && currentUser.role === UserRole.admin ? <div className={styles.buttons}>
				<Button type="flat" label={this.state.isEditingModeOn ? 'Save changes' : (this.state.isWaitingForResponse ? 'Updating...' : 'Edit resource')} hasSpinner={true} isLoading={resource.status && resource.status !== ResourceStatus.idle} onClick={this.state.isEditingModeOn ? this.handleSaveChangesClick : this.handleEditResourceClick} />
				{this.state.isEditingModeOn ? <Button type="invisible" label="Discard changes" onClick={this.handleDiscardChangesClick} /> : null}
			</div> : null}
		</main>;
	}

	handleEditResourceClick = () => {
		this.setState({
			isEditingModeOn: true,
			isWaitingForResponse: false,
			isDoneMessageVisible: false,
			type: this.props.resource && this.props.resource.type ? this.props.resource.type : '',
			name: this.props.resource && this.props.resource.name ? this.props.resource.name : '',
			description: this.props.resource && this.props.resource.description ? this.props.resource.description : ''
		});
	}

	handleSaveChangesClick = () => {
		let {resource} = this.props;

		if (resource) {
			updateResourceActionStream.push({
				uuid: resource.uuid,
				type: this.state.type as ResourceType,
				name: this.state.name,
				description: this.state.description ? this.state.description : null
			});

			this.setState({
				isEditingModeOn: false,
				isWaitingForResponse: true,
				isDoneMessageVisible: false,
			});
		}
	}

	handleDiscardChangesClick = () => {
		this.setState({
			isEditingModeOn: false,
			isWaitingForResponse: false,
			isDoneMessageVisible: false
		});
	}

	handleNameChange = (name: string) => {
		this.setState({name});
	}

	handleTypeChange = (type: string) => {
		this.setState({type});
	}

	handleDescriptionChange = (description: string) => {
		this.setState({description});
	}
}
