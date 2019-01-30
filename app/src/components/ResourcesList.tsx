import Inferno from 'inferno';
import Component from 'inferno-component';
import {I18n, Stream} from '../libs/ash-utils';
import {Button, Spinner, tableStyles} from '../libs/ash-components';

import browserRouter from '../streams/browserRouter';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import usersStream from '../streams/usersStream';
import methodsStream, {MethodsStreamStatus} from '../streams/methodsStream';
import resourcesStream, {ResourcesStreamStatus} from '../streams/resourcesStream';
import createMethodActionStream from '../streams/createMethodActionStream';
import deleteResourceActionStream from '../streams/deleteResourceActionStream';
// import openModalActionStream from '../streams/openModalActionStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import {UserRole} from '../types/User';
import Method, {MethodStatus} from '../types/Method';
import Resource, {ResourceStatus} from '../types/Resource';
import {OpenModal} from '../types/AppState';
import styles from './MethodsList.css';


let i18n = new I18n();

interface ResourceCardProps {
	resource: Resource;
}

class ResourceCard extends Component<ResourceCardProps, {}> {
	render() {
		let {currentUser} = usersStream.value;
		let {resource} = this.props;

		return <section className={tableStyles.root}>
			<header className={tableStyles.itemHeader}>
				<h3 className={`${tableStyles.itemHeading} ${styles.tableItemHeading}`}>
					<span className={tableStyles.label}>{resource.type}</span>
					<a href={link('resource', resource.uuid, resource.name)} onClick={this.handleLinkClick}>{resource.name}</a>
				</h3>
				{currentUser && currentUser.role === UserRole.admin ? <p className={`${tableStyles.itemInfo} ${tableStyles.isCenterAligned}`}>
					<span className={tableStyles.label}>Actions</span>
					<span className={tableStyles.value}><Button type="invisible" size="small" icon="delete" iconHref={link('assets', `icons.svg`)} isDisabled={resource.status === ResourceStatus.deleting} onClick={this.handleDeleteButtonClick} /></span>
				</p> : null}
			</header>
		</section>;
	}

	handleLinkClick = (event: MouseEvent) => {
		if (event.button !== 1) {
			let url = (event.target as Element).getAttribute('href');

			if (url && isUrlInternal(url)) {
				event.preventDefault();

				browserRouter.navigate(url);
			}
		}
	}

	handleDeleteButtonClick = () => {
		let {resource} = this.props;

		deleteResourceActionStream.push({uuid: resource.uuid});
	}
}

export default class ResourcesList extends Component<{}, {}> {
	private onAppStateStream: Stream<{}>;
	private onLanguageStream: Stream<{}>;
	private onUsersStream: Stream<{}>;
	private onMethodsStream: Stream<{}>;
	private onResourcesStream: Stream<{}>;

	componentDidMount() {
		this.onAppStateStream = appStateStream.on(() => this.forceUpdate());
		this.onLanguageStream = languageStream.on(() => this.forceUpdate());
		this.onUsersStream = usersStream.on(() => this.forceUpdate());
		this.onMethodsStream = methodsStream.on(() => this.forceUpdate());
		this.onResourcesStream = resourcesStream.on(() => this.forceUpdate());
	}

	componentDidUnmount() {
		this.onAppStateStream.end();
		this.onLanguageStream.end();
		this.onUsersStream.end();
		this.onMethodsStream.end();
		this.onResourcesStream.end();
	}

	render() {
		// let {methods} = methodsStream.value;
		let {resources, status} = resourcesStream.value;
		let {currentUser} = usersStream.value;

		return <article className={styles.root}>
			<h1 className={styles.heading}>Resources</h1>

			{currentUser && (currentUser.role === UserRole.user || currentUser.role === UserRole.admin) ? <div className={styles.buttons}>
				<Button label="Add new resource" onClick={this.handleOpenCreateResourceModal} />
			</div> : null}

			{resources.map((resource: Resource, resourceIndex: number) => <ResourceCard key={resourceIndex} resource={resource} />)}
			{status === ResourcesStreamStatus.loading ? <div className={styles.spinner}><Spinner isVisible={true} /></div> : null}
		</article>;
	}

	handleOpenCreateResourceModal = () => {
		// openModalActionStream.push({modal: OpenModal.createMethod});
	}
}
