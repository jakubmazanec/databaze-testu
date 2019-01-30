import Component from 'inferno-component';
import { I18n } from '../libs/ash-utils';
import _ from 'lodash';
import { Button, Spinner, Input, tableStyles } from '../libs/ash-components';
import browserRouter from '../streams/browserRouter';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import usersStream from '../streams/usersStream';
import methodsStream, { MethodsStreamStatus } from '../streams/methodsStream';
import resourcesStream, { ResourcesStreamStatus } from '../streams/resourcesStream';
import updateMethodActionStream from '../streams/updateMethodActionStream';
import deleteResourceActionStream from '../streams/deleteResourceActionStream';
import openModalActionStream from '../streams/openModalActionStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import { UserRole } from '../types/User';
import { MethodStatus } from '../types/Method';
import { ResourceStatus } from '../types/Resource';
import { OpenModal } from '../types/AppState';
import styles from './MethodDetail.css';
const SPLIT_REGEXP = /\s*[,;]\s*/;
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
        })]), currentUser && (currentUser.role === UserRole.user || currentUser.role === UserRole.admin) ? createVNode(2, 'p', `${tableStyles.itemInfo} ${tableStyles.isCenterAligned}`, [createVNode(2, 'span', tableStyles.label, 'Actions'), createVNode(2, 'span', tableStyles.value, createVNode(16, Button, null, null, {
            'type': 'invisible',
            'size': 'small',
            'icon': 'delete',
            'iconHref': link('assets', `icons.svg`),
            'isDisabled': resource.status === ResourceStatus.deleting,
            'onClick': this.handleDeleteButtonClick
        }))]) : null]));
    }
}
export default class MethodDetail extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            isEditingModeOn: false,
            isWaitingForResponse: false,
            isDoneMessageVisible: false,
            name: this.props.method && this.props.method.name ? this.props.method.name : '',
            shortName: this.props.method && this.props.method.shortName ? this.props.method.shortName : '',
            localName: this.props.method && this.props.method.localName ? this.props.method.localName : '',
            localShortName: this.props.method && this.props.method.localShortName ? this.props.method.localShortName : '',
            description: this.props.method && this.props.method.description ? this.props.method.description : '',
            tags: this.props.method && this.props.method.tags ? this.props.method.tags : [],
            authors: this.props.method && this.props.method.authors ? this.props.method.authors : [],
            source: this.props.method && this.props.method.source ? this.props.method.source : ''
        };
        this.handleEditMethodClick = () => {
            this.setState({
                isEditingModeOn: true,
                isWaitingForResponse: false,
                isDoneMessageVisible: false,
                name: this.props.method && this.props.method.name ? this.props.method.name : '',
                shortName: this.props.method && this.props.method.shortName ? this.props.method.shortName : '',
                localName: this.props.method && this.props.method.localName ? this.props.method.localName : '',
                localShortName: this.props.method && this.props.method.localShortName ? this.props.method.localShortName : '',
                description: this.props.method && this.props.method.description ? this.props.method.description : '',
                tags: this.props.method && this.props.method.tags ? this.props.method.tags : [],
                authors: this.props.method && this.props.method.authors ? this.props.method.authors : [],
                source: this.props.method && this.props.method.source ? this.props.method.source : ''
            });
        };
        this.handleSaveChangesClick = () => {
            let { method } = this.props;
            if (method) {
                updateMethodActionStream.push({
                    uuid: method.uuid,
                    name: this.state.name,
                    shortName: this.state.shortName ? this.state.shortName : null,
                    localName: this.state.localName ? this.state.localName : null,
                    localShortName: this.state.localShortName ? this.state.localShortName : null,
                    description: this.state.description ? this.state.description : null,
                    tags: this.state.tags.length ? this.state.tags.map(tag => tag.trim()) : null,
                    authors: this.state.authors.length ? this.state.authors.map(author => author.trim()) : null,
                    source: this.state.source ? this.state.source : null
                });
                this.setState({
                    isEditingModeOn: false,
                    isWaitingForResponse: true,
                    isDoneMessageVisible: false
                });
            }
        };
        this.handleDiscardChangesClick = () => {
            this.setState({
                isEditingModeOn: false,
                isWaitingForResponse: false,
                isDoneMessageVisible: false
            });
        };
        this.handleCreateResourceClick = () => {
            let { method } = this.props;
            if (method) {
                openModalActionStream.push({ modal: OpenModal.createResource, parameter: method.uuid });
            }
        };
        this.handleNameChange = name => {
            this.setState({ name });
        };
        this.handleShortNameChange = shortName => {
            this.setState({ shortName });
        };
        this.handleLocalNameChange = localName => {
            this.setState({ localName });
        };
        this.handleLocalShortNameChange = localShortName => {
            this.setState({ localShortName });
        };
        this.handleDescriptionChange = description => {
            this.setState({ description });
        };
        this.handleTagsChange = tags => {
            this.setState({ tags: tags.split(SPLIT_REGEXP) });
        };
        this.handleAuthorsChange = authors => {
            this.setState({ authors: authors.split(SPLIT_REGEXP) });
        };
        this.handleSourceChange = source => {
            this.setState({ source });
        };
    }
    componentDidMount() {
        this.onAppStateStream = appStateStream.on(() => this.forceUpdate());
        this.onLanguageStream = languageStream.on(() => this.forceUpdate());
        this.onUsersStream = usersStream.on(() => this.forceUpdate());
        this.onMethodsStream = methodsStream.subscribe(() => {
            let { method } = this.props;
            if (method) {
                let { methods } = methodsStream.value;
                let resourceIndex = _.findIndex(methods, { uuid: method.uuid });
                if (this.state.isWaitingForResponse && methods[resourceIndex].status === MethodStatus.idle) {
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
        let { currentUser } = usersStream.value;
        let { methods, status: methodsStreamStatus } = methodsStream.value;
        let { resources, status: resourcesStreamStatus } = resourcesStream.value;
        let { method } = this.props;
        if (!method) {
            return methodsStreamStatus === MethodsStreamStatus.loading ? createVNode(2, 'main', styles.root, createVNode(2, 'div', styles.fallbackContent, createVNode(16, Spinner, null, null, {
                'isVisible': true
            }))) : createVNode(2, 'main', styles.root, createVNode(2, 'div', styles.fallbackContent, createVNode(2, 'p', null, 'Sorry, we can\u2019t find this method.')));
        }
        return createVNode(2, 'main', styles.root, [createVNode(2, 'h2', styles.heading, this.state.isEditingModeOn ? createVNode(16, Input, null, null, {
            'name': 'name',
            'value': this.state.name,
            'onChange': this.handleNameChange
        }) : `${method.name}`), createVNode(2, 'div', styles.row, createVNode(2, 'div', styles.wideRowItem, [createVNode(2, 'h4', styles.attributeHeading, 'Description'), createVNode(2, 'p', `${method.description ? '' : styles.isUnknown} ${this.state.isEditingModeOn ? styles.isBeingEdited : ''}`, this.state.isEditingModeOn ? createVNode(16, Input, null, null, {
            'name': 'description',
            'value': this.state.description,
            'onChange': this.handleDescriptionChange
        }) : method.description ? `${method.description}` : '?')])), createVNode(2, 'div', styles.row, [createVNode(2, 'div', styles.doubleRowItem, [createVNode(2, 'h4', styles.attributeHeading, 'Local name'), createVNode(2, 'p', method.localName ? '' : styles.isUnknown, this.state.isEditingModeOn ? createVNode(16, Input, null, null, {
            'name': 'localName',
            'value': this.state.localName,
            'onChange': this.handleLocalNameChange
        }) : method.localName ? `${method.localName}` : '?')]), createVNode(2, 'div', styles.rowItem, [createVNode(2, 'h4', styles.attributeHeading, 'Short name'), createVNode(2, 'p', method.shortName ? '' : styles.isUnknown, this.state.isEditingModeOn ? createVNode(16, Input, null, null, {
            'name': 'shortName',
            'value': this.state.shortName,
            'onChange': this.handleShortNameChange
        }) : method.shortName ? `${method.shortName}` : '?')]), createVNode(2, 'div', styles.rowItem, [createVNode(2, 'h4', styles.attributeHeading, 'Short local name'), createVNode(2, 'p', method.localShortName ? '' : styles.isUnknown, this.state.isEditingModeOn ? createVNode(16, Input, null, null, {
            'name': 'localShortName',
            'value': this.state.localShortName,
            'onChange': this.handleLocalShortNameChange
        }) : method.localShortName ? `${method.localShortName}` : '?')])]), createVNode(2, 'div', styles.row, [createVNode(2, 'div', styles.doubleRowItem, [createVNode(2, 'h4', styles.attributeHeading, 'Authors'), createVNode(2, 'p', method.authors && method.authors.length ? '' : styles.isUnknown, this.state.isEditingModeOn ? createVNode(16, Input, null, null, {
            'name': 'authors',
            'value': this.state.authors.join('; '),
            'onChange': this.handleAuthorsChange
        }) : method.authors && method.authors.length ? method.authors.map((author, authorIndex) => createVNode(2, 'span', styles.author, author, null, authorIndex)) : '?')]), createVNode(2, 'div', styles.tripleRowItem, [createVNode(2, 'h4', styles.attributeHeading, 'Source'), createVNode(2, 'p', method.source ? '' : styles.isUnknown, this.state.isEditingModeOn ? createVNode(16, Input, null, null, {
            'name': 'source',
            'value': this.state.source,
            'onChange': this.handleSourceChange
        }) : method.source ? `${method.source}` : '?')])]), createVNode(2, 'div', styles.row, createVNode(2, 'div', styles.rowItem, [createVNode(2, 'h4', styles.attributeHeading, 'Tags'), createVNode(2, 'p', method.tags && method.tags.length ? '' : styles.isUnknown, this.state.isEditingModeOn ? createVNode(16, Input, null, null, {
            'name': 'tags',
            'value': this.state.tags.join('; '),
            'onChange': this.handleTagsChange
        }) : method.tags && method.tags.length ? method.tags.map((tag, tagIndex) => createVNode(2, 'span', styles.tag, tag, null, tagIndex)) : '?')])), currentUser && currentUser.role === UserRole.admin ? createVNode(2, 'div', styles.buttons, [createVNode(16, Button, null, null, {
            'type': 'flat',
            'label': this.state.isEditingModeOn ? 'Save changes' : this.state.isWaitingForResponse ? 'Updating...' : 'Edit method',
            'hasSpinner': true,
            'isLoading': method.status && method.status !== MethodStatus.idle,
            'onClick': this.state.isEditingModeOn ? this.handleSaveChangesClick : this.handleEditMethodClick
        }), this.state.isEditingModeOn ? createVNode(16, Button, null, null, {
            'type': 'invisible',
            'label': 'Discard changes',
            'onClick': this.handleDiscardChangesClick
        }) : null]) : null, createVNode(2, 'h3', styles.subeading, 'Resources'), currentUser && (currentUser.role === UserRole.user || currentUser.role === UserRole.admin) ? createVNode(2, 'div', styles.buttons, createVNode(16, Button, null, null, {
            'label': 'Create resource',
            'onClick': this.handleCreateResourceClick
        })) : null, resources.filter(resource => method && resource.method && resource.method.uuid === method.uuid).map((resource, resourceIndex) => createVNode(16, ResourceCard, null, null, {
            'resource': resource
        }, resourceIndex)), resourcesStreamStatus === ResourcesStreamStatus.loading ? createVNode(2, 'div', styles.spinner, createVNode(16, Spinner, null, null, {
            'isEnabled': true
        })) : null]);
    }
}