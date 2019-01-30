import $ from 'jquery';
import _ from 'lodash';
import Component from 'inferno-component';
import { I18n } from '../libs/ash-utils';
import { Form, FormRow, Input, RadioButton, Button } from '../libs/ash-components';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import methodsStream from '../streams/methodsStream';
import resourcesStream, { ResourcesStreamStatus } from '../streams/resourcesStream';
import createResourceActionStream from '../streams/createResourceActionStream';
import openModalActionStream from '../streams/openModalActionStream';
import link from '../utils/link';
import { ResourceType } from '../types/Resource';
import { OpenModal } from '../types/AppState';
import styles from './CreateResourceModal.css';
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
export default class CreateResourceModal extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            type: ResourceType.original,
            name: '',
            description: '',
            isWaitingForResponse: false,
            isDoneMessageVisible: false
        };
        this.refs = {};
        this.handleCloseClick = event => {
            if (this.refs.root && $(event.target).is(this.refs.root)) {
                openModalActionStream.push({ modal: OpenModal.none });
            }
        };
        this.handleCloseButtonClick = () => {
            openModalActionStream.push({ modal: OpenModal.none });
        };
        this.handleCreateResourceClick = () => {
            let { methodUuid } = this.props;
            let { status } = resourcesStream.value;
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
        };
        this.handleTypeChange = type => {
            this.setState({ type: type });
        };
        this.handleNameChange = name => {
            this.setState({
                name,
                isDoneMessageVisible: false
            });
        };
        this.handleDescriptionChange = description => {
            this.setState({
                description,
                isDoneMessageVisible: false
            });
        };
    }
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
        let { methods } = methodsStream.value;
        let { resources, status } = resourcesStream.value;
        let { isOpen, methodUuid } = this.props;
        let method = _.find(methods, { uuid: methodUuid });
        if (!method) {
            return createVNode(2, 'dialog', styles.root + (isOpen ? ` ${styles.isOpen}` : ''), createVNode(2, 'div', styles.content, createVNode(2, 'p', null, 'Method does not exist.')), {
                'open': isOpen,
                'onClick': this.handleCloseClick
            }, null, node => {
                this.refs.root = node;
            });
        }
        return createVNode(2, 'dialog', styles.root + (isOpen ? ` ${styles.isOpen}` : ''), [createVNode(2, 'div', styles.content, [createVNode(2, 'h1', styles.heading, 'Create new resource'), createVNode(16, Form, null, null, {
            children: [createVNode(16, FormRow, null, null, {
                'label': 'Method',
                children: createVNode(2, 'p', null, method.name)
            }), createVNode(16, FormRow, null, null, {
                'label': 'Type',
                children: createVNode(16, RadioButton, null, null, {
                    'name': 'type',
                    'items': Object.values(ResourceType).map(type => ({
                        value: type,
                        label: getResourceTypeLabel(type),
                        isChecked: this.state.type === type,
                        isDisabled: false
                    })),
                    'onChange': this.handleTypeChange
                })
            }), createVNode(16, FormRow, null, null, {
                'label': 'Name',
                children: createVNode(16, Input, null, null, {
                    'name': 'name',
                    'value': this.state.name,
                    'onChange': this.handleNameChange
                })
            }), createVNode(16, FormRow, null, null, {
                'label': 'Description',
                children: createVNode(16, Input, null, null, {
                    'name': 'description',
                    'value': this.state.description,
                    'onChange': this.handleDescriptionChange
                })
            }), createVNode(16, FormRow, null, null, {
                'className': styles.buttons,
                children: [createVNode(16, Button, null, null, {
                    'type': 'flat',
                    'hasSpinner': true,
                    'label': this.state.isDoneMessageVisible ? 'Done!' : this.state.isWaitingForResponse ? 'Creating...' : 'Create resource',
                    'isLoading': status === ResourcesStreamStatus.loading || this.state.isWaitingForResponse,
                    'isDisabled': !this.state.name && !this.state.isDoneMessageVisible,
                    'onClick': this.handleCreateResourceClick
                }), createVNode(16, Button, null, null, {
                    'type': 'invisible',
                    'label': 'Close',
                    'onClick': this.handleCloseButtonClick
                })]
            })]
        })]), createVNode(2, 'div', styles.closeButton, createVNode(16, Button, null, null, {
            'type': 'invisible',
            'size': 'small',
            'icon': 'close',
            'iconHref': link('assets', `icons.svg`),
            'onClick': this.handleCloseButtonClick
        }))], {
            'open': isOpen,
            'onClick': this.handleCloseClick
        }, null, node => {
            this.refs.root = node;
        });
    }
}