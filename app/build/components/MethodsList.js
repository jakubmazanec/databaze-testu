import Component from 'inferno-component';
import { I18n } from '../libs/ash-utils';
import { Button, Spinner, tableStyles } from '../libs/ash-components';
import browserRouter from '../streams/browserRouter';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import usersStream from '../streams/usersStream';
import methodsStream, { MethodsStreamStatus } from '../streams/methodsStream';
import deleteMethodActionStream from '../streams/deleteMethodActionStream';
import openModalActionStream from '../streams/openModalActionStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import { UserRole } from '../types/User';
import { MethodStatus } from '../types/Method';
import { OpenModal } from '../types/AppState';
import styles from './MethodsList.css';
let i18n = new I18n();
import { createVNode } from 'inferno';
class MethodCard extends Component {
    constructor() {
        super(...arguments);
        this.handleLinkClick = event => {
            if (event.button !== 1) {
                let url = event.target.getAttribute('href');
                if (url && isUrlInternal(url)) {
                    event.preventDefault();
                    browserRouter.navigate(url);
                }
            }
        };
        this.handleDeleteButtonClick = () => {
            let { method } = this.props;
            deleteMethodActionStream.push({ uuid: method.uuid });
        };
    }
    render() {
        let { currentUser } = usersStream.value;
        let { method } = this.props;
        return createVNode(2, 'section', tableStyles.root, createVNode(2, 'header', tableStyles.itemHeader, [createVNode(2, 'h3', `${tableStyles.itemHeading} ${styles.tableItemHeading}`, [createVNode(2, 'span', tableStyles.label, 'Name'), createVNode(2, 'a', null, method.name, {
            'href': link('method', method.uuid, method.name),
            'onClick': this.handleLinkClick
        })]), currentUser && currentUser.role === UserRole.admin ? createVNode(2, 'p', `${tableStyles.itemInfo} ${tableStyles.isCenterAligned}`, [createVNode(2, 'span', tableStyles.label, 'Actions'), createVNode(2, 'span', tableStyles.value, createVNode(16, Button, null, null, {
            'type': 'invisible',
            'size': 'small',
            'icon': 'delete',
            'iconHref': link('assets', `icons.svg`),
            'isDisabled': method.status === MethodStatus.deleting,
            'onClick': this.handleDeleteButtonClick
        }))]) : null]));
    }
}
export default class MethodsList extends Component {
    constructor() {
        super(...arguments);
        this.handleOpenCreateMethodModal = () => {
            openModalActionStream.push({ modal: OpenModal.createMethod });
        };
    }
    componentDidMount() {
        this.onAppStateStream = appStateStream.on(() => this.forceUpdate());
        this.onLanguageStream = languageStream.on(() => this.forceUpdate());
        this.onUsersStream = usersStream.on(() => this.forceUpdate());
        this.onMethodsStream = methodsStream.on(() => this.forceUpdate());
    }
    componentDidUnmount() {
        this.onAppStateStream.end();
        this.onLanguageStream.end();
        this.onUsersStream.end();
        this.onMethodsStream.end();
    }
    render() {
        let { methods, status } = methodsStream.value;
        let { currentUser } = usersStream.value;
        return createVNode(2, 'article', styles.root, [createVNode(2, 'h1', styles.heading, 'Methods'), currentUser && (currentUser.role === UserRole.user || currentUser.role === UserRole.admin) ? createVNode(2, 'div', styles.buttons, createVNode(16, Button, null, null, {
            'label': 'Add new method',
            'onClick': this.handleOpenCreateMethodModal
        })) : null, methods.map((method, methodIndex) => createVNode(16, MethodCard, null, null, {
            'method': method
        }, methodIndex)), status === MethodsStreamStatus.loading ? createVNode(2, 'div', styles.spinner, createVNode(16, Spinner, null, null, {
            'isVisible': true
        })) : null]);
    }
}