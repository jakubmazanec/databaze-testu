import Component from 'inferno-component';
import { I18n } from '../libs/ash-utils';
import { Button, Form, FormRow, Input } from '../libs/ash-components';
import browserRouter from '../streams/browserRouter';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import pageIdStream from '../streams/pageIdStream';
import usersStream, { UsersStreamStatus } from '../streams/usersStream';
import resetPasswordActionStream from '../streams/resetPasswordActionStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import styles from './ResetPassword.css';
const SPLIT_REGEXP = /\s*[,;]\s*/;
let i18n = new I18n();
import { createVNode } from 'inferno';
export default class ResetPassword extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            isWaitingForResponse: false,
            isDone: false,
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
        this.handlePasswordResetClick = () => {
            let { current: token } = pageIdStream.value;
            if (this.state.password && token) {
                resetPasswordActionStream.push({
                    password: this.state.password,
                    token
                });
                this.setState({
                    isWaitingForResponse: true,
                    isDone: false
                });
            }
        };
        this.handlePasswordChange = password => {
            this.setState({ password });
        };
    }
    componentDidMount() {
        this.onAppStateStream = appStateStream.subscribe(() => this.forceUpdate());
        this.onLanguageStream = languageStream.subscribe(() => this.forceUpdate());
        this.onPageIdStream = pageIdStream.subscribe(() => this.forceUpdate());
        this.onUserStream = usersStream.subscribe(() => {
            if (this.state.isWaitingForResponse) {
                this.setState({
                    isWaitingForResponse: false,
                    isDone: true,
                    password: ''
                });
            } else {
                this.forceUpdate();
            }
        });
    }
    componentDidUnmount() {
        this.onAppStateStream.end();
        this.onLanguageStream.end();
        this.onPageIdStream.end();
        this.onUserStream.end();
    }
    render() {
        return createVNode(2, 'main', styles.root, [createVNode(2, 'h2', styles.heading, 'Reset password'), this.state.isDone ? createVNode(2, 'p', null, ['Done! You can ', createVNode(2, 'a', null, 'log in', {
            'href': link('login'),
            'onClick': this.handleClick
        })]) : createVNode(16, Form, null, null, {
            children: [createVNode(16, FormRow, null, null, {
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
                    'label': 'Reset password',
                    'isLoading': usersStream.value.status === UsersStreamStatus.loading,
                    'isDisabled': !this.state.password,
                    'onClick': this.handlePasswordResetClick
                })
            })]
        })]);
    }
}