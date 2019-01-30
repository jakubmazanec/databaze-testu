import Component from 'inferno-component';
import { I18n } from '../libs/ash-utils';
import { Button, Spinner, tableStyles } from '../libs/ash-components';
import browserRouter from '../streams/browserRouter';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import usersStream from '../streams/usersStream';
import methodsStream from '../streams/methodsStream';
import resourcesStream, { ResourcesStreamStatus } from '../streams/resourcesStream';
import deleteResourceActionStream from '../streams/deleteResourceActionStream';
// import openModalActionStream from '../streams/openModalActionStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import { UserRole } from '../types/User';
import { ResourceStatus } from '../types/Resource';
import styles from './MethodsList.css';
let i18n = new I18n();
import { createVNode } from 'inferno';
class ResourceCard extends Component {
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
            let { resource } = this.props;
            deleteResourceActionStream.push({ uuid: resource.uuid });
        };
    }
    render() {
        let { currentUser } = usersStream.value;
        let { resource } = this.props;
        return createVNode(2, 'section', tableStyles.root, createVNode(2, 'header', tableStyles.itemHeader, [createVNode(2, 'h3', `${tableStyles.itemHeading} ${styles.tableItemHeading}`, [createVNode(2, 'span', tableStyles.label, resource.type), createVNode(2, 'a', null, resource.name, {
            'href': link('resource', resource.uuid, resource.name),
            'onClick': this.handleLinkClick
        })]), currentUser && currentUser.role === UserRole.admin ? createVNode(2, 'p', `${tableStyles.itemInfo} ${tableStyles.isCenterAligned}`, [createVNode(2, 'span', tableStyles.label, 'Actions'), createVNode(2, 'span', tableStyles.value, createVNode(16, Button, null, null, {
            'type': 'invisible',
            'size': 'small',
            'icon': 'delete',
            'iconHref': link('assets', `icons.svg`),
            'isDisabled': resource.status === ResourceStatus.deleting,
            'onClick': this.handleDeleteButtonClick
        }))]) : null]));
    }
}
export default class ResourcesList extends Component {
    constructor() {
        super(...arguments);
        this.handleOpenCreateResourceModal = () => {
            // openModalActionStream.push({modal: OpenModal.createMethod});
        };
    }
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
        let { resources, status } = resourcesStream.value;
        let { currentUser } = usersStream.value;
        return createVNode(2, 'article', styles.root, [createVNode(2, 'h1', styles.heading, 'Resources'), currentUser && (currentUser.role === UserRole.user || currentUser.role === UserRole.admin) ? createVNode(2, 'div', styles.buttons, createVNode(16, Button, null, null, {
            'label': 'Add new resource',
            'onClick': this.handleOpenCreateResourceModal
        })) : null, resources.map((resource, resourceIndex) => createVNode(16, ResourceCard, null, null, {
            'resource': resource
        }, resourceIndex)), status === ResourcesStreamStatus.loading ? createVNode(2, 'div', styles.spinner, createVNode(16, Spinner, null, null, {
            'isVisible': true
        })) : null]);
    }
}