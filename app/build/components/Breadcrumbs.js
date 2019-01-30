import Component from 'inferno-component';
import browserRouter from '../streams/browserRouter';
import routeStream from '../streams/routeStream';
import usersStream from '../streams/usersStream';
import logoutActionStream from '../streams/logoutActionStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import styles from './Breadcrumbs.css';
import { createVNode } from 'inferno';
export default class Breadcrumbs extends Component {
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
        this.handleLogoutClick = event => {
            event.preventDefault();
            logoutActionStream.push(true);
        };
    }
    componentDidMount() {
        this.onRouteStream = routeStream.subscribe(() => this.forceUpdate());
        this.onUsersStream = usersStream.subscribe(() => this.forceUpdate());
    }
    componentDidUnmount() {
        this.onRouteStream.end();
        this.onUsersStream.end();
    }
    render() {
        let { currentUser } = usersStream.value;
        let { page, subpage } = routeStream.value;
        let level1 = null;
        let level2 = null;
        return createVNode(2, 'nav', styles.root, [createVNode(2, 'ol', styles.menu, [createVNode(2, 'li', null, createVNode(2, 'a', null, 'Methods', {
            'href': link('methods')
        })), createVNode(2, 'li', null, createVNode(2, 'a', null, 'Resources', {
            'href': link('resources')
        })), currentUser ? null : createVNode(2, 'li', null, createVNode(2, 'a', null, 'Sign up', {
            'href': link('signup')
        })), currentUser ? createVNode(2, 'li', null, createVNode(2, 'a', styles.logoutLink, 'Log out', {
            'onClick': this.handleLogoutClick
        }), null, 'logout') : null, !currentUser ? createVNode(2, 'li', null, createVNode(2, 'a', null, 'Log in', {
            'href': link('login')
        }), null, 'login') : null]), createVNode(2, 'ol', styles.breadcrumbs, createVNode(2, 'li', null, createVNode(2, 'a', null, '\u25CA', {
            'href': link()
        })))], {
            'onClick': this.handleClick
        });
    }
}