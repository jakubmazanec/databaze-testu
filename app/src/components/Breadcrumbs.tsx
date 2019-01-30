import Inferno from 'inferno';
import Component from 'inferno-component';
import _ from 'lodash';
import {Stream} from '../libs/ash-utils';

import browserRouter from '../streams/browserRouter';
import router from '../streams/router';
import routeStream from '../streams/routeStream';
import usersStream from '../streams/usersStream';
import logoutActionStream from '../streams/logoutActionStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import styles from './Breadcrumbs.css';


export default class Breadcrumbs extends Component<{}, {}> {
	private onRouteStream: Stream<{}>;
	private onUsersStream: Stream<{}>;

	componentDidMount() {
		this.onRouteStream = routeStream.subscribe(() => this.forceUpdate());
		this.onUsersStream = usersStream.subscribe(() => this.forceUpdate());
	}

	componentDidUnmount() {
		this.onRouteStream.end();
		this.onUsersStream.end();
	}

	render() {
		let {currentUser} = usersStream.value;
		let {page, subpage} = routeStream.value;
		let level1 = null;
		let level2 = null;

		return <nav className={styles.root} onClick={this.handleClick}>
			<ol className={styles.menu}>
				<li><a href={link('methods')}>Methods</a></li>
				<li><a href={link('resources')}>Resources</a></li>
				{currentUser ? null : <li><a href={link('signup')}>Sign up</a></li>}
				{currentUser ? <li key="logout"><a className={styles.logoutLink} onClick={this.handleLogoutClick}>Log out</a></li> : null}
				{!currentUser ? <li key="login"><a href={link('login')}>Log in</a></li> : null}
			</ol>

			<ol className={styles.breadcrumbs}>
				<li><a href={link()}>◊</a></li>
			</ol>
		</nav>;
	}

	handleClick = (event: MouseEvent) => {
		if (event.button !== 1) {
			let url = (event.target as Element).getAttribute('href');

			if (url && isUrlInternal(url)) {
				event.preventDefault();

				browserRouter.navigate(url);
			}
		}
	}

	handleLogoutClick = (event: Event) => {
		event.preventDefault();

		logoutActionStream.push(true);
	}
}
