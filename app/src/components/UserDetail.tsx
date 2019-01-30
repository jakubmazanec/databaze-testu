import Inferno from 'inferno';
import Component from 'inferno-component';
import {I18n, Stream} from '../libs/ash-utils';
import _ from 'lodash';
import {Button, Spinner, Input, tableStyles} from '../libs/ash-components';

import browserRouter from '../streams/browserRouter';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import usersStream, {UsersStreamStatus} from '../streams/usersStream';
import updateUserActionStream, {UpdateUserAction} from '../streams/updateUserActionStream';
import deleteResourceActionStream from '../streams/deleteResourceActionStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import User, {UserRole, UserStatus} from '../types/User';
import styles from './UserDetail.css';


const SPLIT_REGEXP = /\s*[,;]\s*/;

let i18n = new I18n();

export interface UserDetailProps {
	user: User | null;
}

export default class UserDetail extends Component<UserDetailProps, {}> {
	state = {
		isEditingModeOn: false,
		isWaitingForResponse: false,
		isDoneMessageVisible: false,
		password: '',
		name: this.props.user && this.props.user.name ? this.props.user.name : '',
		affiliation: this.props.user && this.props.user.affiliation ? this.props.user.affiliation : ''
	};

	private onAppStateStream: Stream<{}>;
	private onLanguageStream: Stream<{}>;
	private onUsersStream: Stream<{}>;

	componentDidMount() {
		this.onAppStateStream = appStateStream.subscribe(() => this.forceUpdate());
		this.onLanguageStream = languageStream.subscribe(() => this.forceUpdate());
		this.onUsersStream = usersStream.subscribe(() => {
			let {user} = this.props;

			if (user) {
				let {users} = usersStream.value;
				let userIndex = _.findIndex(users, {uuid: user.uuid});

				if (this.state.isWaitingForResponse && users[userIndex].status === UserStatus.idle) {
					this.setState({
						isWaitingForResponse: false,
						isDoneMessageVisible: true
					});
				} else {
					this.forceUpdate();
				}
			} else {
				this.forceUpdate();
			}
		});
	}

	componentDidUnmount() {
		this.onAppStateStream.end();
		this.onLanguageStream.end();
		this.onUsersStream.end();
	}

	render() {
		let {currentUser, status: usersStreamStatus} = usersStream.value;
		let {user} = this.props;

		if (!user) {
			return usersStreamStatus === UsersStreamStatus.loading ? <main className={styles.root}>
				<div className={styles.fallbackContent}>
					<Spinner isVisible={true} />
				</div>
			</main> : <main className={styles.root}>
				<div className={styles.fallbackContent}>
					<p>Sorry, we can’t find this user.</p>
				</div>
			</main>;
		}

		return <main className={styles.root}>
			<h2 className={styles.heading}>
				{this.state.isEditingModeOn ? <Input name="name" value={this.state.name} onChange={this.handleNameChange} /> : `${user.name}`}
			</h2>

			<div className={styles.row}>
				<div className={styles.wideRowItem}>
					<h4 className={styles.attributeHeading}>Affiliation</h4>
					<p className={`${user.affiliation ? '' : styles.isUnknown} ${this.state.isEditingModeOn ? styles.isBeingEdited : ''}`}>
						{this.state.isEditingModeOn ? <Input name="affiliation" value={this.state.affiliation} onChange={this.handleAffiliationChange} /> : (user.affiliation ? `${user.affiliation}` : '?')}
					</p>
				</div>
			</div>

			<div className={styles.row}>
				<div className={styles.doubleRowItem}>
					<h4 className={styles.attributeHeading}>Password</h4>
					<p className={styles.isUnknown}>
						{this.state.isEditingModeOn ? <Input name="password" value={this.state.password} onChange={this.handlePasswordChange} /> : 'Secret!'}
					</p>
				</div>
			</div>

			{currentUser && currentUser.uuid === user.uuid ? <div className={styles.buttons}>
				<Button type="flat" label={this.state.isEditingModeOn ? 'Save changes' : (this.state.isWaitingForResponse ? 'Updating...' : 'Edit user')} hasSpinner={true} isLoading={user.status && user.status !== UserStatus.idle} onClick={this.state.isEditingModeOn ? this.handleSaveChangesClick : this.handleEditMethodClick} />
				{this.state.isEditingModeOn ? <Button type="invisible" label="Discard changes" onClick={this.handleDiscardChangesClick} /> : null}
			</div> : null}
		</main>;
	}

	handleEditMethodClick = () => {
		this.setState({
			isEditingModeOn: true,
			isWaitingForResponse: false,
			isDoneMessageVisible: false,
			password: '',
			name: this.props.user && this.props.user.name ? this.props.user.name : '',
			affiliation: this.props.user && this.props.user.affiliation ? this.props.user.affiliation : ''
		});
	}

	handleSaveChangesClick = () => {
		let {user} = this.props;

		if (user) {
			let updateMethodAction: UpdateUserAction = {
				uuid: user.uuid,
				name: this.state.name ? this.state.name : null,
				affiliation: this.state.affiliation ? this.state.affiliation : null
			};

			if (this.state.password) {
				updateMethodAction.password = this.state.password;
			}

			updateUserActionStream.push(updateMethodAction);

			this.setState({
				isEditingModeOn: false,
				isWaitingForResponse: true,
				isDoneMessageVisible: false,
			});
		}
	}

	handleDiscardChangesClick = () => {
		this.setState({
			isEditingModeOn: false,
			isWaitingForResponse: false,
			isDoneMessageVisible: false
		});
	}

	handlePasswordChange = (password: string) => {
		this.setState({password});
	}

	handleNameChange = (name: string) => {
		this.setState({name});
	}

	handleAffiliationChange = (affiliation: string) => {
		this.setState({affiliation});
	}
}
