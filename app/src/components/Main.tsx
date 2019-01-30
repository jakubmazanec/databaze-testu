import Inferno from 'inferno';
import Component from 'inferno-component';
import {I18n, Stream} from '../libs/ash-utils';
import {Spinner} from '../libs/ash-components';
import _ from 'lodash';

import UserDetail from './UserDetail';
import MethodsList from './MethodsList';
import MethodDetail from './MethodDetail';
import ResourcesList from './ResourcesList';
import ResourceDetail from './ResourceDetail';
import Login from './Login';
import Signup from './Signup';
import EmailVerification from './EmailVerification';
import ForgottenPassword from './ForgottenPassword';
import ResetPassword from './ResetPassword';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import usersStream from '../streams/usersStream';
import pageStream from '../streams/pageStream';
import pageIdStream from '../streams/pageIdStream';
import pageNameStream from '../streams/pageNameStream';
import methodsStream, {MethodsStreamStatus} from '../streams/methodsStream';
import resourcesStream, {ResourcesStreamStatus} from '../streams/resourcesStream';
import {OpenModal} from '../types/AppState';
import styles from './Main.css';


let i18n = new I18n();

export default class Main extends Component<{}, {}> {
	private onAppStateStream: Stream<{}>;
	private onLanguageStream: Stream<{}>;
	private onUsersStream: Stream<{}>;
	private onPageStream: Stream<{}>;
	private onPageIdStream: Stream<{}>;
	private onPageNameStream: Stream<{}>;
	private onMethodsStream: Stream<{}>;
	private onResourcesStream: Stream<{}>;

	componentDidMount() {
		// this.onAppStateStream = appStateStream.on(() => this.forceUpdate());
		this.onLanguageStream = languageStream.on(() => this.forceUpdate());
		this.onUsersStream = usersStream.on(() => this.forceUpdate());
		this.onPageStream = pageStream.on(() => this.forceUpdate());
		this.onPageIdStream = pageIdStream.on(() => this.forceUpdate());
		this.onPageNameStream = pageNameStream.on(() => this.forceUpdate());
		this.onMethodsStream = methodsStream.on(() => this.forceUpdate());
		this.onResourcesStream = resourcesStream.on(() => this.forceUpdate());
	}

	componentDidUnmount() {
		// this.onAppStateStream.end();
		this.onLanguageStream.end();
		this.onUsersStream.end();
		this.onPageStream.end();
		this.onPageIdStream.end();
		this.onPageNameStream.end();
		this.onMethodsStream.end();
		this.onResourcesStream.end();
	}

	render() {
		// let appState = appStateStream.value;
		let {users, currentUser} = usersStream.value;
		let {current: page} = pageStream.value;
		let {current: pageId} = pageIdStream.value;
		let {methods} = methodsStream.value;
		let {resources} = resourcesStream.value;
		let pageElement = <MethodsList />;

		if (page === 'user') {
			let user = pageId ? _.find(users, {uuid: pageId}) : null;

			if (user) {
				pageElement = <UserDetail user={user} />;
			} else {
				pageElement = <UserDetail user={null} />;
			}
		} else if (page === 'method') {
			let method = pageId ? _.find(methods, {uuid: pageId}) : null;

			if (method) {
				pageElement = <MethodDetail method={method} />;
			} else {
				pageElement = <MethodDetail method={null} />;
			}
		} else if (page === 'resources') {
			pageElement = <ResourcesList />;
		} else if (page === 'resource') {
			let resource = pageId ? _.find(resources, {uuid: pageId}) : null;

			if (resource) {
				pageElement = <ResourceDetail resource={resource} />;
			} else {
				pageElement = <ResourceDetail resource={null} />;
			}
		} else if (page === 'login') {
			if (currentUser) {
				pageElement = <div className={styles.fallbackContent}>
					You are logged in!
				</div>;
			} else {
				pageElement = <Login />;
			}
		} else if (page === 'signup') {
			pageElement = <Signup />;
		} else if (page === 'verify-email') {
			pageElement = <EmailVerification />;
		} else if (page === 'forgotten-password') {
			pageElement = <ForgottenPassword />;
		} else if (page === 'reset-password') {
			pageElement = <ResetPassword />;
		}

		return <main className={styles.root}>
			{pageElement}
		</main>;
	}
}
