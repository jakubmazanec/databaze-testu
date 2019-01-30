import Component from 'inferno-component';
export interface InputProps {
    type: 'text' | 'email' | 'password';
    id?: string;
    name?: string;
    autocomplete?: boolean;
    value?: string;
    isValid?: boolean;
    isInvalid?: boolean;
    isDisabled?: boolean;
    isRequired?: boolean;
    onChange?: (value: any) => void;
    onSave?: (value: any) => void;
    validator?: (value: any) => void;
}
export default class Input extends Component<InputProps, {}> {
    validate(value: string): string | void;
    render(): any;
    handleInput: (event: Event) => void;
    handleFocusOut: (event: Event) => void;
    handleKeyDown: (event: Event) => void;
}
