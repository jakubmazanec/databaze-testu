import Component from 'inferno-component';
import { I18n } from '../libs/ash-utils';
import _ from 'lodash';
import { Button, Spinner, Input, RadioButton } from '../libs/ash-components';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import usersStream from '../streams/usersStream';
import methodsStream from '../streams/methodsStream';
import resourcesStream, { ResourcesStreamStatus } from '../streams/resourcesStream';
import updateResourceActionStream from '../streams/updateResourceActionStream';
import { UserRole } from '../types/User';
import { ResourceStatus, ResourceType } from '../types/Resource';
import styles from './ResourceDetail.css';
const SPLIT_REGEXP = /\s*[,;]\s*/;
let i18n = new I18n();
let getResourceTypeLabel = type => {
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
import { createVNode } from 'inferno';
export default class ResourceDetail extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            isEditingModeOn: false,
            isWaitingForResponse: false,
            isDoneMessageVisible: false,
            type: this.props.resource && this.props.resource.type ? this.props.resource.type : ResourceType.original,
            name: this.props.resource && this.props.resource.name ? this.props.resource.name : '',
            description: this.props.resource && this.props.resource.description ? this.props.resource.description : ''
        };
        this.handleEditResourceClick = () => {
            this.setState({
                isEditingModeOn: true,
                isWaitingForResponse: false,
                isDoneMessageVisible: false,
                type: this.props.resource && this.props.resource.type ? this.props.resource.type : '',
                name: this.props.resource && this.props.resource.name ? this.props.resource.name : '',
                description: this.props.resource && this.props.resource.description ? this.props.resource.description : ''
            });
        };
        this.handleSaveChangesClick = () => {
            let { resource } = this.props;
            if (resource) {
                updateResourceActionStream.push({
                    uuid: resource.uuid,
                    type: this.state.type,
                    name: this.state.name,
                    description: this.state.description ? this.state.description : null
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
        this.handleNameChange = name => {
            this.setState({ name });
        };
        this.handleTypeChange = type => {
            this.setState({ type });
        };
        this.handleDescriptionChange = description => {
            this.setState({ description });
        };
    }
    componentDidMount() {
        this.onAppStateStream = appStateStream.subscribe(() => this.forceUpdate());
        this.onLanguageStream = languageStream.subscribe(() => this.forceUpdate());
        this.onUsersStream = languageStream.subscribe(() => this.forceUpdate());
        this.onMethodsStream = methodsStream.subscribe(() => this.forceUpdate());
        this.onResourcesStream = resourcesStream.subscribe(() => {
            let { resource } = this.props;
            if (resource) {
                let { resources } = resourcesStream.value;
                let resourceIndex = _.findIndex(resources, { uuid: resource.uuid });
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
        let { currentUser } = usersStream.value;
        let { methods } = methodsStream.value;
        let { resources, status: resourcesStreamStatus } = resourcesStream.value;
        let { resource } = this.props;
        if (!resource) {
            return resourcesStreamStatus === ResourcesStreamStatus.loading ? createVNode(2, 'main', styles.root, createVNode(2, 'div', styles.fallbackContent, createVNode(16, Spinner, null, null, {
                'isVisible': true
            }))) : createVNode(2, 'main', styles.root, createVNode(2, 'div', styles.fallbackContent, createVNode(2, 'p', null, 'Sorry, we can\u2019t find this resource.')));
        }
        // let method = _.find(methods, {uuid: resource.method.uuid});
        return createVNode(2, 'main', styles.root, [createVNode(2, 'h2', styles.heading, this.state.isEditingModeOn ? createVNode(16, Input, null, null, {
            'name': 'name',
            'value': this.state.name,
            'onChange': this.handleNameChange
        }) : `${resource.name}`), createVNode(2, 'div', styles.row, createVNode(2, 'div', styles.doubleRowItem, [createVNode(2, 'h4', styles.attributeHeading, 'Type'), createVNode(2, 'p', resource.type ? '' : styles.isUnknown, this.state.isEditingModeOn ? createVNode(16, RadioButton, null, null, {
            'name': 'type',
            'items': Object.values(ResourceType).map(type => ({
                value: type,
                label: getResourceTypeLabel(type),
                isChecked: this.state.type === type,
                isDisabled: false
            })),
            'onChange': this.handleTypeChange
        }) : resource.type ? `${getResourceTypeLabel(resource.type)}` : '?')])), createVNode(2, 'div', styles.row, createVNode(2, 'div', styles.wideRowItem, [createVNode(2, 'h4', styles.attributeHeading, 'Description'), createVNode(2, 'p', `${resource.description ? '' : styles.isUnknown} ${this.state.isEditingModeOn ? styles.isBeingEdited : ''}`, this.state.isEditingModeOn ? createVNode(16, Input, null, null, {
            'name': 'description',
            'value': this.state.description,
            'onChange': this.handleDescriptionChange
        }) : resource.description ? `${resource.description}` : '?')])), currentUser && currentUser.role === UserRole.admin ? createVNode(2, 'div', styles.buttons, [createVNode(16, Button, null, null, {
            'type': 'flat',
            'label': this.state.isEditingModeOn ? 'Save changes' : this.state.isWaitingForResponse ? 'Updating...' : 'Edit resource',
            'hasSpinner': true,
            'isLoading': resource.status && resource.status !== ResourceStatus.idle,
            'onClick': this.state.isEditingModeOn ? this.handleSaveChangesClick : this.handleEditResourceClick
        }), this.state.isEditingModeOn ? createVNode(16, Button, null, null, {
            'type': 'invisible',
            'label': 'Discard changes',
            'onClick': this.handleDiscardChangesClick
        }) : null]) : null]);
    }
}