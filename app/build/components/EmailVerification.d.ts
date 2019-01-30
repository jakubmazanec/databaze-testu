import Component from 'inferno-component';
export default class EmailVerification extends Component<{}, {}> {
    state: {
        isWaitingForResponse: boolean;
    };
    private onAppStateStream;
    private onLanguageStream;
    private onPageIdStream;
    private onUsersStream;
    componentDidMount(): void;
    componentDidUnmount(): void;
    render(): any;
    handleClick: (event: MouseEvent) => void;
}
