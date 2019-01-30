import Component from 'inferno-component';
import browserRouter from '../streams/browserRouter';
import languageStream from '../streams/languageStream';
import usersStream from '../streams/usersStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import styles from './Header.css';
import { createVNode } from 'inferno';
export default class Header extends Component {
    constructor() {
        super(...arguments);
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
        this.onLanguageStream = languageStream.on(() => this.forceUpdate());
        this.onUserStream = usersStream.on(() => this.forceUpdate());
    }
    componentDidUnmount() {
        this.onLanguageStream.end();
        this.onUserStream.end();
    }
    render() {
        let { currentUser } = usersStream.value;
        return createVNode(2, 'header', styles.root, [createVNode(2, 'h1', null, createVNode(2, 'a', null, 'Datab\xE1ze test\u016F', {
            'href': link('')
        })), currentUser ? createVNode(2, 'a', styles.currentUser, currentUser.email, {
            'href': link('user', currentUser.uuid)
        }) : null], {
            'onClick': this.handleClick
        });
    }
}