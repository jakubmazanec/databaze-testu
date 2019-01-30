import $ from 'jquery';
import Inferno from 'inferno';
import Component from 'inferno-component';
import {I18n, Stream} from '../libs/ash-utils';
import {Form, FormRow, Input, Button, Spinner, tableStyles} from '../libs/ash-components';

import browserRouter from '../streams/browserRouter';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import methodsStream, {MethodsStreamStatus} from '../streams/methodsStream';
import createMethodActionStream from '../streams/createMethodActionStream';
import openModalActionStream from '../streams/openModalActionStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import Method from '../types/Method';
import {OpenModal} from '../types/AppState';
import styles from './CreateMethodModal.css';


const SPLIT_REGEXP = /\s*[,;]\s*/;

let i18n = new I18n();

export default class CreateMethodModal extends Component<{}, {}> {
	state = {
		name: '',
		shortName: '',
		localName: '',
		localShortName: '',
		description: '',
		tags: [],
		authors: [],
		source: '',
		isWaitingForResponse: false,
		isDoneMessageVisible: false
	};

	refs: {
		root?: Element;
	} = {};

	private onAppStateStream: Stream<{}>;
	private onLanguageStream: Stream<{}>;
	private onMethodsStream: Stream<{}>;

	componentDidMount() {
		this.onAppStateStream = appStateStream.on(() => {
			if (appStateStream.value.openModal === OpenModal.createMethod) {
				this.forceUpdate();
			} else {
				this.setState({
					name: '',
					shortName: '',
					localName: '',
					localShortName: '',
					description: '',
					tags: [],
					authors: [],
					source: '',
					isWaitingForResponse: false,
					isDoneMessageVisible: false
				});
			}
		});
		this.onLanguageStream = languageStream.on(() => this.forceUpdate());
		this.onMethodsStream = methodsStream.subscribe(() => {
			if (this.state.isWaitingForResponse && methodsStream.value.status === MethodsStreamStatus.idle) {
				this.setState({
					name: '',
					shortName: '',
					localName: '',
					localShortName: '',
					description: '',
					tags: [],
					authors: [],
					source: '',
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
	}

	render() {
		let {methods, status} = methodsStream.value;
		let isOpen = this.props && this.props.isOpen;

		return <dialog className={styles.root + (isOpen ? ` ${styles.isOpen}` : '')} open={isOpen} onClick={this.handleCloseClick} ref={(node: Element) => { this.refs.root = node; }}>
			<div className={styles.content}>
				<h1 className={styles.heading}>Add new method</h1>

				<Form>
					<FormRow label="Name">
						<Input name="name" value={this.state.name} onChange={this.handleNameChange} />
					</FormRow>

					<FormRow label="Short name">
						<Input name="shortName" value={this.state.shortName} onChange={this.handleShortNameChange} />
					</FormRow>

					<FormRow label="Local name">
						<Input name="localName" value={this.state.localName} onChange={this.handleLocalNameChange} />
					</FormRow>

					<FormRow label="Local short name">
						<Input name="localShortName" value={this.state.localShortName} onChange={this.handleLocalShortNameChange} />
					</FormRow>

					<FormRow label="Description">
						<Input name="description" value={this.state.description} onChange={this.handleDescriptionChange} />
					</FormRow>

					<FormRow label="Tags">
						<Input name="tags" value={this.state.tags.join('; ')} onChange={this.handleTagsChange} />
					</FormRow>

					<FormRow label="Authors">
						<Input name="authors" value={this.state.authors.join('; ')} onChange={this.handleAuthorsChange} />
					</FormRow>

					<FormRow label="Source">
						<Input name="source" value={this.state.source} onChange={this.handleSourceChange} />
					</FormRow>

					<FormRow className={styles.buttons}>
						<Button type="flat" hasSpinner={true} label={this.state.isDoneMessageVisible ? 'Done!' : (this.state.isWaitingForResponse ? 'Creating...' : 'Create method')} isLoading={status === MethodsStreamStatus.loading || this.state.isWaitingForResponse} isDisabled={!this.state.name && !this.state.isDoneMessageVisible} onClick={this.handleCreateMethodClick} />
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

	handleCreateMethodClick = () => {
		if (this.state.name && status !== MethodsStreamStatus.loading) {
			createMethodActionStream.push({
				name: this.state.name,
				shortName: this.state.shortName ? this.state.shortName : null,
				localName: this.state.localName ? this.state.localName : null,
				localShortName: this.state.localShortName ? this.state.localShortName : null,
				description: this.state.description ? this.state.description : null,
				tags: this.state.tags.length ? this.state.tags.map((tag: string) => tag.trim()) : null,
				authors: this.state.authors.length ? this.state.authors.map((author: string) => author.trim()) : null,
				source: this.state.source ? this.state.source : null
			});

			this.setState({
				isWaitingForResponse: true,
				isDoneMessageVisible: false
			});
		}
	}

	handleNameChange = (name: string) => {
		this.setState({
			name,
			isDoneMessageVisible: false
		});
	}

	handleShortNameChange = (shortName: string) => {
		this.setState({
			shortName,
			isDoneMessageVisible: false
		});
	}

	handleLocalNameChange = (localName: string) => {
		this.setState({
			localName,
			isDoneMessageVisible: false
		});
	}

	handleLocalShortNameChange = (localShortName: string) => {
		this.setState({
			localShortName,
			isDoneMessageVisible: false
		});
	}

	handleDescriptionChange = (description: string) => {
		this.setState({
			description,
			isDoneMessageVisible: false
		});
	}

	handleTagsChange = (tags: string) => {
		this.setState({
			tags: tags.split(SPLIT_REGEXP),
			isDoneMessageVisible: false
		});
	}

	handleAuthorsChange = (authors: string) => {
		this.setState({
			authors: authors.split(SPLIT_REGEXP),
			isDoneMessageVisible: false
		});
	}

	handleSourceChange = (source: string) => {
		this.setState({
			source,
			isDoneMessageVisible: false
		});
	}
}
