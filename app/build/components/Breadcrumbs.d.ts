import Component from 'inferno-component';
export default class Breadcrumbs extends Component<{}, {}> {
    private onRouteStream;
    private onUsersStream;
    componentDidMount(): void;
    componentDidUnmount(): void;
    render(): any;
    handleClick: (event: MouseEvent) => void;
    handleLogoutClick: (event: Event) => void;
}
