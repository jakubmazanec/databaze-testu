import Component from 'inferno-component';
export interface TextareaProps {
    id?: string;
    name?: string;
    rows?: number;
    value?: string;
    isValid?: boolean;
    isInvalid?: boolean;
    isDisabled?: boolean;
    handleChange?: (value: string) => void;
    handleSave?: (value: string) => void;
    validator?: (value: string) => string;
}
export default class Textarea extends Component<TextareaProps, {}> {
    validate(value: string): string;
    render(): any;
    handleInput: (event: Event) => void;
    handleFocusOut: (event: Event) => void;
}
