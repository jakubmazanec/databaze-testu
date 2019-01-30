import Component from 'inferno-component';
import { I18n } from '../libs/ash-utils';
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
import languageStream from '../streams/languageStream';
import usersStream from '../streams/usersStream';
import pageStream from '../streams/pageStream';
import pageIdStream from '../streams/pageIdStream';
import pageNameStream from '../streams/pageNameStream';
import methodsStream from '../streams/methodsStream';
import resourcesStream from '../streams/resourcesStream';
import styles from './Main.css';
let i18n = new I18n();
import { createVNode } from 'inferno';
export default class Main extends Component {
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
        let { users, currentUser } = usersStream.value;
        let { current: page } = pageStream.value;
        let { current: pageId } = pageIdStream.value;
        let { methods } = methodsStream.value;
        let { resources } = resourcesStream.value;
        let pageElement = createVNode(16, MethodsList);
        if (page === 'user') {
            let user = pageId ? _.find(users, { uuid: pageId }) : null;
            if (user) {
                pageElement = createVNode(16, UserDetail, null, null, {
                    'user': user
                });
            } else {
                pageElement = createVNode(16, UserDetail, null, null, {
                    'user': null
                });
            }
        } else if (page === 'method') {
            let method = pageId ? _.find(methods, { uuid: pageId }) : null;
            if (method) {
                pageElement = createVNode(16, MethodDetail, null, null, {
                    'method': method
                });
            } else {
                pageElement = createVNode(16, MethodDetail, null, null, {
                    'method': null
                });
            }
        } else if (page === 'resources') {
            pageElement = createVNode(16, ResourcesList);
        } else if (page === 'resource') {
            let resource = pageId ? _.find(resources, { uuid: pageId }) : null;
            if (resource) {
                pageElement = createVNode(16, ResourceDetail, null, null, {
                    'resource': resource
                });
            } else {
                pageElement = createVNode(16, ResourceDetail, null, null, {
                    'resource': null
                });
            }
        } else if (page === 'login') {
            if (currentUser) {
                pageElement = createVNode(2, 'div', styles.fallbackContent, 'You are logged in!');
            } else {
                pageElement = createVNode(16, Login);
            }
        } else if (page === 'signup') {
            pageElement = createVNode(16, Signup);
        } else if (page === 'verify-email') {
            pageElement = createVNode(16, EmailVerification);
        } else if (page === 'forgotten-password') {
            pageElement = createVNode(16, ForgottenPassword);
        } else if (page === 'reset-password') {
            pageElement = createVNode(16, ResetPassword);
        }
        return createVNode(2, 'main', styles.root, pageElement);
    }
}