import Inferno from 'inferno';
import Component from 'inferno-component';
import {Stream} from '../libs/ash-utils';

import browserRouter from '../streams/browserRouter';
import languageStream from '../streams/languageStream';
import usersStream from '../streams/usersStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import styles from './Header.css';


export default class Header extends Component<{}, {}> {
	onLanguageStream: Stream<{}>;
	onUserStream: Stream<{}>;

	componentDidMount() {
		this.onLanguageStream = languageStream.on(() => this.forceUpdate());
		this.onUserStream = usersStream.on(() => this.forceUpdate());
	}

	componentDidUnmount() {
		this.onLanguageStream.end();
		this.onUserStream.end();
	}

	render() {
		let {currentUser} = usersStream.value;

		return <header className={styles.root} onClick={this.handleClick}>
			<h1><a href={link('')}>Databáze testů</a></h1>
			{currentUser ? <a className={styles.currentUser} href={link('user', currentUser.uuid)}>{currentUser.email}</a> : null}
		</header>;
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
}
