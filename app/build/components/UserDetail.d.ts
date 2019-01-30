import Component from 'inferno-component';
import User from '../types/User';
export interface UserDetailProps {
    user: User | null;
}
export default class UserDetail extends Component<UserDetailProps, {}> {
    state: {
        isEditingModeOn: boolean;
        isWaitingForResponse: boolean;
        isDoneMessageVisible: boolean;
        password: string;
        name: string;
        affiliation: string;
    };
    private onAppStateStream;
    private onLanguageStream;
    private onUsersStream;
    componentDidMount(): void;
    componentDidUnmount(): void;
    render(): any;
    handleEditMethodClick: () => void;
    handleSaveChangesClick: () => void;
    handleDiscardChangesClick: () => void;
    handlePasswordChange: (password: string) => void;
    handleNameChange: (name: string) => void;
    handleAffiliationChange: (affiliation: string) => void;
}
