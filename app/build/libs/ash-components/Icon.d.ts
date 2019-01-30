import Component from 'inferno-component';
export interface IconProps {
    id: string;
    size?: string;
    href?: string;
}
export default class Icon extends Component<IconProps, {}> {
    refs: {
        root?: Element;
        use?: Element;
    };
    render(): any;
    componentDidMount(): void;
}
