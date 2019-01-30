import Component from 'inferno-component';
import { Stream } from '../libs/ash-utils';
export default class Footer extends Component<{}, {}> {
    onLanguageStream: Stream<{}>;
    componentDidMount(): void;
    componentDidUnmount(): void;
    render(): any;
    handleClick: (event: MouseEvent) => void;
}
