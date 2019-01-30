import Inferno from 'inferno';
import Component from 'inferno-component';
import {I18n, Stream} from '../libs/ash-utils';
import _ from 'lodash';
import {Button, Form, FormRow, Input} from '../libs/ash-components';

import browserRouter from '../streams/browserRouter';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import usersStream, {UsersStreamStatus} from '../streams/usersStream';
import forgottenPasswordActionStream from '../streams/forgottenPasswordActionStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import styles from './ForgottenPassword.css';


const SPLIT_REGEXP = /\s*[,;]\s*/;

let i18n = new I18n();

export default class ForgottenPassword extends Component<{}, {}> {
	state = {
		isWaitingForResponse: false,
		isDone: false,
		email: ''
	};

	private onAppStateStream: Stream<{}>;
	private onLanguageStream: Stream<{}>;
	private onUserStream: Stream<{}>;

	componentDidMount() {
		this.onAppStateStream = appStateStream.subscribe(() => this.forceUpdate());
		this.onLanguageStream = languageStream.subscribe(() => this.forceUpdate());
		this.onUserStream = usersStream.subscribe(() => {
			if (this.state.isWaitingForResponse) {
				this.setState({
					isWaitingForResponse: false,
					isDone: true,
					email: ''
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
		return <main className={styles.root}>
			<h2 className={styles.heading}>
				Forgotten password
			</h2>

			{this.state.isDone ? <p>Check your inbox for email with password reset link.</p> : <Form>
				<FormRow label="Email">
					<Input name="email" value={this.state.email} onChange={this.handleEmailChange} />
				</FormRow>

				<FormRow className={styles.buttons}>
					<Button type="flat" hasSpinner={true} label="Request reset link" isLoading={usersStream.value.status === UsersStreamStatus.loading} isDisabled={!this.state.email} onClick={this.handleLoginClick} />
				</FormRow>
			</Form>}
		</main>;
	}

	handleLoginClick = () => {
		if (this.state.email) {
			forgottenPasswordActionStream.push({
				email: this.state.email
			});

			this.setState({
				isWaitingForResponse: true,
				isDone: false
			});
		}
	}

	handleEmailChange = (email: string) => {
		this.setState({email});
	}
}
