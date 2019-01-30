import Inferno from 'inferno';
import Component from 'inferno-component';

import styles from './Input.css';


const ENTER_KEY_CODE = 13;

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
	validate(value: string) {
		return this.props && this.props.validator ? this.props.validator(value) : value;
	}

	render() {
		return this.props && typeof this.props.value !== 'undefined' ? <input
			key={this.props ? this.props.id || this.props.name : ''}
			className={styles.default + (this.props && this.props.isValid ? ' isValid' : '') + (this.props && this.props.isInvalid ? ' isInvalid' : '') + (this.props && this.props.isDisabled ? ' isDisabled' : ' isEnabled') + (this.props && this.props.isRequired ? ' isRequired' : '')}
			type={this.props ? this.props.type : 'text'}
			name={this.props ? this.props.name || this.props.id : ''}
			id={this.props ? this.props.id || this.props.name : ''}
			value={this.props ? this.props.value : undefined}
			autoComplete={this.props ? this.props.autocomplete : false}
			disabled={this.props ? this.props.isDisabled : false}
			onBlur={this.handleFocusOut}
			onInput={this.handleInput}
			onKeyDown={this.handleKeyDown} /> : <input
			key={this.props ? this.props.id || this.props.name : ''}
			className={styles.default + (this.props && this.props.isValid ? ' isValid' : '') + (this.props && this.props.isInvalid ? ' isInvalid' : '') + (this.props && this.props.isDisabled ? ' isDisabled' : ' isEnabled') + (this.props && this.props.isRequired ? ' isRequired' : '')}
			type={this.props ? this.props.type : 'text'}
			name={this.props ? this.props.name || this.props.id : ''}
			id={this.props ? this.props.id || this.props.name : ''}
			autoComplete={this.props ? this.props.autocomplete : false}
			disabled={this.props ? this.props.isDisabled : false}
			onBlur={this.handleFocusOut}
			onInput={this.handleInput}
			onKeyDown={this.handleKeyDown} />;
	}

	handleInput = (event: Event) => {
		if (this.props && this.props.onChange) {
			this.props.onChange(this.validate((event.target as any).value));
		}
	}

	handleFocusOut = (event: Event) => {
		if (this.props && this.props.onSave) {
			this.props.onSave(this.validate((event.target as any).value));
		}
	}

	handleKeyDown = (event: Event) => {
		if ((event as any).keyCode === ENTER_KEY_CODE) {
			if (this.props && this.props.onSave) {
				this.props.onSave(this.validate((event.target as any).value));
			}
		}
	}
}
