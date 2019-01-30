import Inferno from 'inferno';
import Component from 'inferno-component';
import {I18n, Stream} from '../libs/ash-utils';
import _ from 'lodash';
import {Button, Form, FormRow, Input} from '../libs/ash-components';

import browserRouter from '../streams/browserRouter';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import usersStream, {UsersStreamStatus} from '../streams/usersStream';
import loginActionStream from '../streams/loginActionStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import styles from './Login.css';


const SPLIT_REGEXP = /\s*[,;]\s*/;

let i18n = new I18n();

export default class Login extends Component<{}, {}> {
	state = {
		isEditingModeOn: false,
		isWaitingForResponse: false,
		isDoneMessageVisible: false,
		email: '',
		password: ''
	};

	private onAppStateStream: Stream<{}>;
	private onLanguageStream: Stream<{}>;
	private onUserStream: Stream<{}>;

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
		return <main className={styles.root}>
			<h2 className={styles.heading}>
				Log in
			</h2>

			<Form>
				<FormRow label="Email">
					<Input name="email" value={this.state.email} onChange={this.handleEmailChange} />
				</FormRow>

				<FormRow label="Password">
					<Input name="password" type="password" value={this.state.password} onChange={this.handlePasswordChange} />
				</FormRow>

				<FormRow className={styles.buttons}>
					<Button type="flat" hasSpinner={true} label="Log in" isLoading={usersStream.value.status === UsersStreamStatus.loading} isDisabled={!this.state.email && !this.state.password} onClick={this.handleLoginClick} />
					<a href={link('forgotten-password')} onClick={this.handleClick}>Forgotten password?</a>
				</FormRow>
			</Form>
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

	handleLoginClick = () => {
		if (this.state.email && this.state.password) {
			loginActionStream.push({
				email: this.state.email,
				password: this.state.password
			});
		}
	}

	handleEmailChange = (email: string) => {
		this.setState({email});
	}

	handlePasswordChange = (password: string) => {
		this.setState({password});
	}
}
