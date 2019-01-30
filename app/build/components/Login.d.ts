import Component from 'inferno-component';
export default class Login extends Component<{}, {}> {
    state: {
        isEditingModeOn: boolean;
        isWaitingForResponse: boolean;
        isDoneMessageVisible: boolean;
        email: string;
        password: string;
    };
    private onAppStateStream;
    private onLanguageStream;
    private onUserStream;
    componentDidMount(): void;
    componentDidUnmount(): void;
    render(): any;
    handleClick: (event: MouseEvent) => void;
    handleLoginClick: () => void;
    handleEmailChange: (email: string) => void;
    handlePasswordChange: (password: string) => void;
}
