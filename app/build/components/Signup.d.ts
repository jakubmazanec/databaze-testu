import Component from 'inferno-component';
export default class Signup extends Component<{}, {}> {
    state: {
        isWaitingForResponse: boolean;
        isDone: boolean;
        email: string;
        password: string;
    };
    private onAppStateStream;
    private onLanguageStream;
    private onUserStream;
    componentDidMount(): void;
    componentDidUnmount(): void;
    render(): any;
    handleLoginClick: () => void;
    handleEmailChange: (email: string) => void;
    handlePasswordChange: (password: string) => void;
}
