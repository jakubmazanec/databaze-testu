import Component from 'inferno-component';
import { BrowserRouter } from '../ash-utils';
export interface ButtonProps {
    id?: string;
    name?: string;
    type?: 'flat' | 'invisible';
    size?: string;
    link?: string;
    label?: string;
    badge?: string;
    icon?: string;
    selectedIcon?: string;
    iconAfter?: string;
    selectedIconAfter?: string;
    isSelected?: boolean;
    isDisabled?: boolean;
    isFailed?: boolean;
    isSubmit?: boolean;
    hasSpinner?: boolean;
    isLoading?: boolean;
    useRouter?: boolean;
    onClick: () => any;
    router?: BrowserRouter;
    iconHref?: string;
}
export default class Button extends Component<ButtonProps, {}> {
    render(): any;
    handleClick: (event: Event) => void;
}
