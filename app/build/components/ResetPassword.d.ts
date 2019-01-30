import Component from 'inferno-component';
export default class ResetPassword extends Component<{}, {}> {
    state: {
        isWaitingForResponse: boolean;
        isDone: boolean;
        password: string;
    };
    private onAppStateStream;
    private onLanguageStream;
    private onPageIdStream;
    private onUserStream;
    componentDidMount(): void;
    componentDidUnmount(): void;
    render(): any;
    handleClick: (event: MouseEvent) => void;
    handlePasswordResetClick: () => void;
    handlePasswordChange: (password: string) => void;
}
