import Component from 'inferno-component';
import { I18n } from '../libs/ash-utils';
import _ from 'lodash';
import { Button, Spinner, Input } from '../libs/ash-components';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import usersStream, { UsersStreamStatus } from '../streams/usersStream';
import updateUserActionStream from '../streams/updateUserActionStream';
import { UserStatus } from '../types/User';
import styles from './UserDetail.css';
const SPLIT_REGEXP = /\s*[,;]\s*/;
let i18n = new I18n();
import { createVNode } from 'inferno';
export default class UserDetail extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            isEditingModeOn: false,
            isWaitingForResponse: false,
            isDoneMessageVisible: false,
            password: '',
            name: this.props.user && this.props.user.name ? this.props.user.name : '',
            affiliation: this.props.user && this.props.user.affiliation ? this.props.user.affiliation : ''
        };
        this.handleEditMethodClick = () => {
            this.setState({
                isEditingModeOn: true,
                isWaitingForResponse: false,
                isDoneMessageVisible: false,
                password: '',
                name: this.props.user && this.props.user.name ? this.props.user.name : '',
                affiliation: this.props.user && this.props.user.affiliation ? this.props.user.affiliation : ''
            });
        };
        this.handleSaveChangesClick = () => {
            let { user } = this.props;
            if (user) {
                let updateMethodAction = {
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
                    isDoneMessageVisible: false
                });
            }
        };
        this.handleDiscardChangesClick = () => {
            this.setState({
                isEditingModeOn: false,
                isWaitingForResponse: false,
                isDoneMessageVisible: false
            });
        };
        this.handlePasswordChange = password => {
            this.setState({ password });
        };
        this.handleNameChange = name => {
            this.setState({ name });
        };
        this.handleAffiliationChange = affiliation => {
            this.setState({ affiliation });
        };
    }
    componentDidMount() {
        this.onAppStateStream = appStateStream.subscribe(() => this.forceUpdate());
        this.onLanguageStream = languageStream.subscribe(() => this.forceUpdate());
        this.onUsersStream = usersStream.subscribe(() => {
            let { user } = this.props;
            if (user) {
                let { users } = usersStream.value;
                let userIndex = _.findIndex(users, { uuid: user.uuid });
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
        let { currentUser, status: usersStreamStatus } = usersStream.value;
        let { user } = this.props;
        if (!user) {
            return usersStreamStatus === UsersStreamStatus.loading ? createVNode(2, 'main', styles.root, createVNode(2, 'div', styles.fallbackContent, createVNode(16, Spinner, null, null, {
                'isVisible': true
            }))) : createVNode(2, 'main', styles.root, createVNode(2, 'div', styles.fallbackContent, createVNode(2, 'p', null, 'Sorry, we can\u2019t find this user.')));
        }
        return createVNode(2, 'main', styles.root, [createVNode(2, 'h2', styles.heading, this.state.isEditingModeOn ? createVNode(16, Input, null, null, {
            'name': 'name',
            'value': this.state.name,
            'onChange': this.handleNameChange
        }) : `${user.name}`), createVNode(2, 'div', styles.row, createVNode(2, 'div', styles.wideRowItem, [createVNode(2, 'h4', styles.attributeHeading, 'Affiliation'), createVNode(2, 'p', `${user.affiliation ? '' : styles.isUnknown} ${this.state.isEditingModeOn ? styles.isBeingEdited : ''}`, this.state.isEditingModeOn ? createVNode(16, Input, null, null, {
            'name': 'affiliation',
            'value': this.state.affiliation,
            'onChange': this.handleAffiliationChange
        }) : user.affiliation ? `${user.affiliation}` : '?')])), createVNode(2, 'div', styles.row, createVNode(2, 'div', styles.doubleRowItem, [createVNode(2, 'h4', styles.attributeHeading, 'Password'), createVNode(2, 'p', styles.isUnknown, this.state.isEditingModeOn ? createVNode(16, Input, null, null, {
            'name': 'password',
            'value': this.state.password,
            'onChange': this.handlePasswordChange
        }) : 'Secret!')])), currentUser && currentUser.uuid === user.uuid ? createVNode(2, 'div', styles.buttons, [createVNode(16, Button, null, null, {
            'type': 'flat',
            'label': this.state.isEditingModeOn ? 'Save changes' : this.state.isWaitingForResponse ? 'Updating...' : 'Edit user',
            'hasSpinner': true,
            'isLoading': user.status && user.status !== UserStatus.idle,
            'onClick': this.state.isEditingModeOn ? this.handleSaveChangesClick : this.handleEditMethodClick
        }), this.state.isEditingModeOn ? createVNode(16, Button, null, null, {
            'type': 'invisible',
            'label': 'Discard changes',
            'onClick': this.handleDiscardChangesClick
        }) : null]) : null]);
    }
}