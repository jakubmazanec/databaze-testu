import Component from 'inferno-component';
export default class ForgottenPassword extends Component<{}, {}> {
    state: {
        isWaitingForResponse: boolean;
        isDone: boolean;
        email: string;
    };
    private onAppStateStream;
    private onLanguageStream;
    private onUserStream;
    componentDidMount(): void;
    componentDidUnmount(): void;
    render(): any;
    handleLoginClick: () => void;
    handleEmailChange: (email: string) => void;
}
