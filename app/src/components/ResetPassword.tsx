import Inferno from 'inferno';
import Component from 'inferno-component';
import {I18n, Stream} from '../libs/ash-utils';
import _ from 'lodash';
import {Button, Form, FormRow, Input} from '../libs/ash-components';

import browserRouter from '../streams/browserRouter';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import pageIdStream from '../streams/pageIdStream';
import usersStream, {UsersStreamStatus} from '../streams/usersStream';
import resetPasswordActionStream from '../streams/resetPasswordActionStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import styles from './ResetPassword.css';


const SPLIT_REGEXP = /\s*[,;]\s*/;

let i18n = new I18n();

export default class ResetPassword extends Component<{}, {}> {
	state = {
		isWaitingForResponse: false,
		isDone: false,
		password: ''
	};

	private onAppStateStream: Stream<{}>;
	private onLanguageStream: Stream<{}>;
	private onPageIdStream: Stream<{}>;
	private onUserStream: Stream<{}>;

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
		return <main className={styles.root}>
			<h2 className={styles.heading}>
				Reset password
			</h2>

			{this.state.isDone ? <p>Done! You can <a href={link('login')} onClick={this.handleClick}>log in</a></p> : <Form>
				<FormRow label="Password">
					<Input name="password" value={this.state.password} onChange={this.handlePasswordChange} />
				</FormRow>

				<FormRow className={styles.buttons}>
					<Button type="flat" hasSpinner={true} label="Reset password" isLoading={usersStream.value.status === UsersStreamStatus.loading} isDisabled={!this.state.password} onClick={this.handlePasswordResetClick} />
				</FormRow>
			</Form>}
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

	handlePasswordResetClick = () => {
		let {current: token} = pageIdStream.value;

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
	}

	handlePasswordChange = (password: string) => {
		this.setState({password});
	}
}
