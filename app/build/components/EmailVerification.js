import Component from 'inferno-component';
import { I18n } from '../libs/ash-utils';
import { Spinner } from '../libs/ash-components';
import browserRouter from '../streams/browserRouter';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import pageIdStream from '../streams/pageIdStream';
import usersStream, { UsersStreamStatus } from '../streams/usersStream';
import verifyEmailActionStream from '../streams/verifyEmailActionStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import styles from './EmailVerification.css';
const SPLIT_REGEXP = /\s*[,;]\s*/;
let i18n = new I18n();
import { createVNode } from 'inferno';
export default class EmailVerification extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            isWaitingForResponse: true
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
    }
    componentDidMount() {
        this.onAppStateStream = appStateStream.subscribe(() => this.forceUpdate());
        this.onLanguageStream = languageStream.subscribe(() => this.forceUpdate());
        this.onPageIdStream = pageIdStream.subscribe(() => this.forceUpdate());
        this.onUsersStream = usersStream.subscribe(() => this.forceUpdate());
        let { current: token } = pageIdStream.value;
        if (token) {
            verifyEmailActionStream.push({ token });
        }
    }
    componentDidUnmount() {
        this.onAppStateStream.end();
        this.onLanguageStream.end();
        this.onPageIdStream.end();
        this.onUsersStream.end();
    }
    render() {
        return createVNode(2, 'main', styles.root, [createVNode(2, 'h2', styles.heading, 'Verify email'), status === UsersStreamStatus.loading ? createVNode(2, 'div', styles.spinner, createVNode(16, Spinner, null, null, {
            'isVisible': true
        })) : createVNode(2, 'p', null, ['The account has been verified. You can ', createVNode(2, 'a', null, 'log in', {
            'href': link('login')
        }), ' now.'])], {
            'onClick': this.handleClick
        });
    }
}