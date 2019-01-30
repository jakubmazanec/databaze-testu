import Inferno from 'inferno';
import Component from 'inferno-component';
import {I18n, Stream} from '../libs/ash-utils';
import _ from 'lodash';
import jwt from 'jwt-decode';
import {Spinner} from '../libs/ash-components';

import browserRouter from '../streams/browserRouter';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import pageIdStream from '../streams/pageIdStream';
import usersStream, {UsersStreamStatus} from '../streams/usersStream';
import verifyEmailActionStream from '../streams/verifyEmailActionStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import styles from './EmailVerification.css';


const SPLIT_REGEXP = /\s*[,;]\s*/;

let i18n = new I18n();

export default class EmailVerification extends Component<{}, {}> {
	state = {
		isWaitingForResponse: true
	};

	private onAppStateStream: Stream<{}>;
	private onLanguageStream: Stream<{}>;
	private onPageIdStream: Stream<{}>;
	private onUsersStream: Stream<{}>;

	componentDidMount() {
		this.onAppStateStream = appStateStream.subscribe(() => this.forceUpdate());
		this.onLanguageStream = languageStream.subscribe(() => this.forceUpdate());
		this.onPageIdStream = pageIdStream.subscribe(() => this.forceUpdate());
		this.onUsersStream = usersStream.subscribe(() => this.forceUpdate());

		let {current: token} = pageIdStream.value;

		if (token) {
			verifyEmailActionStream.push({token});
		}
	}

	componentDidUnmount() {
		this.onAppStateStream.end();
		this.onLanguageStream.end();
		this.onPageIdStream.end();
		this.onUsersStream.end();
	}

	render() {
		return <main className={styles.root} onClick={this.handleClick}>
			<h2 className={styles.heading}>
				Verify email
			</h2>

			{status === UsersStreamStatus.loading ? <div className={styles.spinner}><Spinner isVisible={true} /></div> : <p>The account has been verified. You can <a href={link('login')}>log in</a> now.</p>}

		</main>;
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
