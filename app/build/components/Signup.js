import Component from 'inferno-component';
import { I18n } from '../libs/ash-utils';
import { Button, Form, FormRow, Input } from '../libs/ash-components';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import usersStream, { UsersStreamStatus } from '../streams/usersStream';
import signupActionStream from '../streams/signupActionStream';
import styles from './Signup.css';
const SPLIT_REGEXP = /\s*[,;]\s*/;
let i18n = new I18n();
import { createVNode } from 'inferno';
export default class Signup extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            isWaitingForResponse: false,
            isDone: false,
            email: '',
            password: ''
        };
        this.handleLoginClick = () => {
            if (this.state.email && this.state.password) {
                signupActionStream.push({
                    email: this.state.email,
                    password: this.state.password
                });
                this.setState({
                    isWaitingForResponse: true,
                    isDone: false
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
        this.onUserStream = usersStream.subscribe(() => {
            if (this.state.isWaitingForResponse) {
                this.setState({
                    isWaitingForResponse: false,
                    isDone: true
                });
            } else {
                this.forceUpdate();
            }
        });
    }
    componentDidUnmount() {
        this.onAppStateStream.end();
        this.onLanguageStream.end();
        this.onUserStream.end();
    }
    render() {
        return createVNode(2, 'main', styles.root, [createVNode(2, 'h2', styles.heading, 'Sign up'), this.state.isDone ? createVNode(2, 'p', null, 'Check your inbox for email with activation link.') : createVNode(16, Form, null, null, {
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
                    'value': this.state.password,
                    'onChange': this.handlePasswordChange
                })
            }), createVNode(16, FormRow, null, null, {
                'className': styles.buttons,
                children: createVNode(16, Button, null, null, {
                    'type': 'flat',
                    'hasSpinner': true,
                    'label': 'Sign up',
                    'isLoading': usersStream.value.status === UsersStreamStatus.loading,
                    'isDisabled': !this.state.email && !this.state.password,
                    'onClick': this.handleLoginClick
                })
            })]
        })]);
    }
}