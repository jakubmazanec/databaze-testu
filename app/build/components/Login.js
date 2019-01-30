import Component from 'inferno-component';
import { I18n } from '../libs/ash-utils';
import { Button, Form, FormRow, Input } from '../libs/ash-components';
import browserRouter from '../streams/browserRouter';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import usersStream, { UsersStreamStatus } from '../streams/usersStream';
import loginActionStream from '../streams/loginActionStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import styles from './Login.css';
const SPLIT_REGEXP = /\s*[,;]\s*/;
let i18n = new I18n();
import { createVNode } from 'inferno';
export default class Login extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            isEditingModeOn: false,
            isWaitingForResponse: false,
            isDoneMessageVisible: false,
            email: '',
            password: ''
        };
        this.handleClick = event => {
            if (event.button !== 1) {
                let url = event.target.getAttribute('href');
                if (url && isUrlInternal(url)) {
                    event.preventDefault();
                    browserRouter.navigate(url);
                }
            }
        };
        this.handleLoginClick = () => {
            if (this.state.email && this.state.password) {
                loginActionStream.push({
                    email: this.state.email,
                    password: this.state.password
                });
            }
        };
        this.handleEmailChange = email => {
            this.setState({ email });
        };
        this.handlePasswordChange = password => {
            this.setState({ password });
        };
    }
    componentDidMount() {
        this.onAppStateStream = appStateStream.subscribe(() => this.forceUpdate());
        this.onLanguageStream = languageStream.subscribe(() => this.forceUpdate());
        this.onUserStream = usersStream.subscribe(() => this.forceUpdate());
    }
    componentDidUnmount() {
        this.onAppStateStream.end();
        this.onLanguageStream.end();
        this.onUserStream.end();
    }
    render() {
        return createVNode(2, 'main', styles.root, [createVNode(2, 'h2', styles.heading, 'Log in'), createVNode(16, Form, null, null, {
            children: [createVNode(16, FormRow, null, null, {
                'label': 'Email',
                children: createVNode(16, Input, null, null, {
                    'name': 'email',
                    'value': this.state.email,
                    'onChange': this.handleEmailChange
                })
            }), createVNode(16, FormRow, null, null, {
                'label': 'Password',
                children: createVNode(16, Input, null, null, {
                    'name': 'password',
                    'type': 'password',
                    'value': this.state.password,
                    'onChange': this.handlePasswordChange
                })
            }), createVNode(16, FormRow, null, null, {
                'className': styles.buttons,
                children: [createVNode(16, Button, null, null, {
                    'type': 'flat',
                    'hasSpinner': true,
                    'label': 'Log in',
                    'isLoading': usersStream.value.status === UsersStreamStatus.loading,
                    'isDisabled': !this.state.email && !this.state.password,
                    'onClick': this.handleLoginClick
                }), createVNode(2, 'a', null, 'Forgotten password?', {
                    'href': link('forgotten-password'),
                    'onClick': this.handleClick
                })]
            })]
        })]);
    }
}