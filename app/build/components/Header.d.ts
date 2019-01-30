import Component from 'inferno-component';
import { Stream } from '../libs/ash-utils';
export default class Header extends Component<{}, {}> {
    onLanguageStream: Stream<{}>;
    onUserStream: Stream<{}>;
    componentDidMount(): void;
    componentDidUnmount(): void;
    render(): any;
    handleClick: (event: MouseEvent) => void;
}
