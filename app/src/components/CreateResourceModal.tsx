import $ from 'jquery';
import _ from 'lodash';
import Inferno from 'inferno';
import Component from 'inferno-component';
import {I18n, Stream} from '../libs/ash-utils';
import {Form, FormRow, Input, RadioButton, Button, Spinner, tableStyles} from '../libs/ash-components';

import browserRouter from '../streams/browserRouter';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import methodsStream, {MethodsStreamStatus} from '../streams/methodsStream';
import resourcesStream, {ResourcesStreamStatus} from '../streams/resourcesStream';
import createResourceActionStream from '../streams/createResourceActionStream';
import openModalActionStream from '../streams/openModalActionStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import Resource, {ResourceType} from '../types/Resource';
import {OpenModal} from '../types/AppState';
import styles from './CreateResourceModal.css';


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

export interface CreateResourceModalProps {
	isOpen: boolean;
	methodUuid?: string;
}

export default class CreateResourceModal extends Component<CreateResourceModalProps, {}> {
	state = {
		type: ResourceType.original,
		name: '',
		description: '',
		isWaitingForResponse: false,
		isDoneMessageVisible: false
	};

	refs: {
		root?: Element;
	} = {};

	private onAppStateStream: Stream<{}>;
	private onLanguageStream: Stream<{}>;
	private onMethodsStream: Stream<{}>;
	private onResourcesStream: Stream<{}>;

	componentDidMount() {
		this.onAppStateStream = appStateStream.on(() => {
			if (appStateStream.value.openModal === OpenModal.createResource) {
				this.forceUpdate();
			} else {
				this.setState({
					type: ResourceType.original,
					name: '',
					description: '',
					isWaitingForResponse: false,
					isDoneMessageVisible: false
				});
			}
		});
		this.onLanguageStream = languageStream.subscribe(() => this.forceUpdate());
		this.onMethodsStream = methodsStream.subscribe(() => this.forceUpdate());
		this.onResourcesStream = resourcesStream.subscribe(() => {
			if (this.state.isWaitingForResponse && resourcesStream.value.status === ResourcesStreamStatus.idle) {
				this.setState({
					type: ResourceType.original,
					name: '',
					description: '',
					isWaitingForResponse: false,
					isDoneMessageVisible: true
				});
			} else {
				this.forceUpdate();
			}
		});
	}

	componentDidUnmount() {
		this.onAppStateStream.end();
		this.onLanguageStream.end();
		this.onMethodsStream.end();
		this.onResourcesStream.end();
	}

	render() {
		let {methods} = methodsStream.value;
		let {resources, status} = resourcesStream.value;
		let {isOpen, methodUuid} = this.props;
		let method = _.find(methods, {uuid: methodUuid});

		if (!method) {
			return <dialog className={styles.root + (isOpen ? ` ${styles.isOpen}` : '')} open={isOpen} onClick={this.handleCloseClick} ref={(node: Element) => { this.refs.root = node; }}>
				<div className={styles.content}>
					<p>Method does not exist.</p>
				</div>
			</dialog>;
		}

		return <dialog className={styles.root + (isOpen ? ` ${styles.isOpen}` : '')} open={isOpen} onClick={this.handleCloseClick} ref={(node: Element) => { this.refs.root = node; }}>
			<div className={styles.content}>
				<h1 className={styles.heading}>Create new resource</h1>

				<Form>
					<FormRow label="Method">
						<p>{method.name}</p>
					</FormRow>

					<FormRow label="Type">
						<RadioButton name="type" items={Object.values(ResourceType).map((type) => ({
							value: type,
							label: getResourceTypeLabel(type as ResourceType),
							isChecked: this.state.type === type,
							isDisabled: false
						}))} onChange={this.handleTypeChange} />
					</FormRow>

					<FormRow label="Name">
						<Input name="name" value={this.state.name} onChange={this.handleNameChange} />
					</FormRow>

					<FormRow label="Description">
						<Input name="description" value={this.state.description} onChange={this.handleDescriptionChange} />
					</FormRow>

					<FormRow className={styles.buttons}>
						<Button type="flat" hasSpinner={true} label={this.state.isDoneMessageVisible ? 'Done!' : (this.state.isWaitingForResponse ? 'Creating...' : 'Create resource')} isLoading={status === ResourcesStreamStatus.loading || this.state.isWaitingForResponse} isDisabled={!this.state.name && !this.state.isDoneMessageVisible} onClick={this.handleCreateResourceClick} />
						<Button type="invisible" label="Close" onClick={this.handleCloseButtonClick} />
					</FormRow>
				</Form>
			</div>

			<div className={styles.closeButton}>
				<Button type="invisible" size="small" icon="close" iconHref={link('assets', `icons.svg`)} onClick={this.handleCloseButtonClick} />
			</div>
		</dialog>;
	}

	handleCloseClick = (event: Event) => {
		if (this.refs.root && $(event.target).is(this.refs.root)) {
			openModalActionStream.push({modal: OpenModal.none});
		}
	}

	handleCloseButtonClick = () => {
		openModalActionStream.push({modal: OpenModal.none});
	}

	handleCreateResourceClick = () => {
		let {methodUuid} = this.props;
		let {status} = resourcesStream.value;

		if (methodUuid && this.state.name && status !== ResourcesStreamStatus.loading) {
			createResourceActionStream.push({
				type: this.state.type,
				name: this.state.name,
				description: this.state.description ? this.state.description : null,
				methodUuid
			});

			this.setState({
				isWaitingForResponse: true,
				isDoneMessageVisible: false
			});
		} else if (methodUuid && this.state.isDoneMessageVisible) {
			this.setState({
				isDoneMessageVisible: false
			});
		}
	}

	handleTypeChange = (type: string) => {
		this.setState({type: type as ResourceType});
	}

	handleNameChange = (name: string) => {
		this.setState({
			name,
			isDoneMessageVisible: false
		});
	}

	handleDescriptionChange = (description: string) => {
		this.setState({
			description,
			isDoneMessageVisible: false
		});
	}
}
