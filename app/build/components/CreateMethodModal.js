import $ from 'jquery';
import Component from 'inferno-component';
import { I18n } from '../libs/ash-utils';
import { Form, FormRow, Input, Button } from '../libs/ash-components';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import methodsStream, { MethodsStreamStatus } from '../streams/methodsStream';
import createMethodActionStream from '../streams/createMethodActionStream';
import openModalActionStream from '../streams/openModalActionStream';
import link from '../utils/link';
import { OpenModal } from '../types/AppState';
import styles from './CreateMethodModal.css';
const SPLIT_REGEXP = /\s*[,;]\s*/;
let i18n = new I18n();
import { createVNode } from 'inferno';
export default class CreateMethodModal extends Component {
    constructor() {
        super(...arguments);
        this.state = {
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
        this.refs = {};
        this.handleCloseClick = event => {
            if (this.refs.root && $(event.target).is(this.refs.root)) {
                openModalActionStream.push({ modal: OpenModal.none });
            }
        };
        this.handleCloseButtonClick = () => {
            openModalActionStream.push({ modal: OpenModal.none });
        };
        this.handleCreateMethodClick = () => {
            if (this.state.name && status !== MethodsStreamStatus.loading) {
                createMethodActionStream.push({
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
                    isWaitingForResponse: true,
                    isDoneMessageVisible: false
                });
            }
        };
        this.handleNameChange = name => {
            this.setState({
                name,
                isDoneMessageVisible: false
            });
        };
        this.handleShortNameChange = shortName => {
            this.setState({
                shortName,
                isDoneMessageVisible: false
            });
        };
        this.handleLocalNameChange = localName => {
            this.setState({
                localName,
                isDoneMessageVisible: false
            });
        };
        this.handleLocalShortNameChange = localShortName => {
            this.setState({
                localShortName,
                isDoneMessageVisible: false
            });
        };
        this.handleDescriptionChange = description => {
            this.setState({
                description,
                isDoneMessageVisible: false
            });
        };
        this.handleTagsChange = tags => {
            this.setState({
                tags: tags.split(SPLIT_REGEXP),
                isDoneMessageVisible: false
            });
        };
        this.handleAuthorsChange = authors => {
            this.setState({
                authors: authors.split(SPLIT_REGEXP),
                isDoneMessageVisible: false
            });
        };
        this.handleSourceChange = source => {
            this.setState({
                source,
                isDoneMessageVisible: false
            });
        };
    }
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
        let { methods, status } = methodsStream.value;
        let isOpen = this.props && this.props.isOpen;
        return createVNode(2, 'dialog', styles.root + (isOpen ? ` ${styles.isOpen}` : ''), [createVNode(2, 'div', styles.content, [createVNode(2, 'h1', styles.heading, 'Add new method'), createVNode(16, Form, null, null, {
            children: [createVNode(16, FormRow, null, null, {
                'label': 'Name',
                children: createVNode(16, Input, null, null, {
                    'name': 'name',
                    'value': this.state.name,
                    'onChange': this.handleNameChange
                })
            }), createVNode(16, FormRow, null, null, {
                'label': 'Short name',
                children: createVNode(16, Input, null, null, {
                    'name': 'shortName',
                    'value': this.state.shortName,
                    'onChange': this.handleShortNameChange
                })
            }), createVNode(16, FormRow, null, null, {
                'label': 'Local name',
                children: createVNode(16, Input, null, null, {
                    'name': 'localName',
                    'value': this.state.localName,
                    'onChange': this.handleLocalNameChange
                })
            }), createVNode(16, FormRow, null, null, {
                'label': 'Local short name',
                children: createVNode(16, Input, null, null, {
                    'name': 'localShortName',
                    'value': this.state.localShortName,
                    'onChange': this.handleLocalShortNameChange
                })
            }), createVNode(16, FormRow, null, null, {
                'label': 'Description',
                children: createVNode(16, Input, null, null, {
                    'name': 'description',
                    'value': this.state.description,
                    'onChange': this.handleDescriptionChange
                })
            }), createVNode(16, FormRow, null, null, {
                'label': 'Tags',
                children: createVNode(16, Input, null, null, {
                    'name': 'tags',
                    'value': this.state.tags.join('; '),
                    'onChange': this.handleTagsChange
                })
            }), createVNode(16, FormRow, null, null, {
                'label': 'Authors',
                children: createVNode(16, Input, null, null, {
                    'name': 'authors',
                    'value': this.state.authors.join('; '),
                    'onChange': this.handleAuthorsChange
                })
            }), createVNode(16, FormRow, null, null, {
                'label': 'Source',
                children: createVNode(16, Input, null, null, {
                    'name': 'source',
                    'value': this.state.source,
                    'onChange': this.handleSourceChange
                })
            }), createVNode(16, FormRow, null, null, {
                'className': styles.buttons,
                children: [createVNode(16, Button, null, null, {
                    'type': 'flat',
                    'hasSpinner': true,
                    'label': this.state.isDoneMessageVisible ? 'Done!' : this.state.isWaitingForResponse ? 'Creating...' : 'Create method',
                    'isLoading': status === MethodsStreamStatus.loading || this.state.isWaitingForResponse,
                    'isDisabled': !this.state.name && !this.state.isDoneMessageVisible,
                    'onClick': this.handleCreateMethodClick
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