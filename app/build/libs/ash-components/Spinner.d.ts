import Component from 'inferno-component';
export interface SpinnerProps {
    isVisible: boolean;
    isInline: boolean;
    isAlternative: boolean;
}
export default class Spinner extends Component<SpinnerProps, {}> {
    render(): any;
}
