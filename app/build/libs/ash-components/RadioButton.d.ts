import Component from 'inferno-component';
export interface RadioButtonProps {
    name: string;
    items: Array<{
        value: string;
        label: string;
        isChecked: boolean;
        isDisabled: boolean;
    }>;
    onChange?: (value: string | null) => void;
    validator?: (value: string) => string | null;
}
export default class RadioButton extends Component<RadioButtonProps, {}> {
    validate(value: string): string | null;
    render(): any;
    handleChange: (event: Event) => void;
}
