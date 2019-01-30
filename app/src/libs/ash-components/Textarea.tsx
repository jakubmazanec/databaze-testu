import Inferno from 'inferno';
import Component from 'inferno-component';

import styles from './Textarea.css';


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
	validate(value: string) {
		return this.props && this.props.validator ? this.props.validator(value) : value;
	}

	render() {
		return this.props && typeof this.props.value !== 'undefined' ? <textarea
			key={this.props ? this.props.id || this.props.name : ''}
			className={styles.default + (this.props && this.props.isValid ? ' isValid' : '') + (this.props && this.props.isInvalid ? ' isInvalid' : '') + (this.props && this.props.isDisabled ? ' isDisabled' : ' isEnabled')}
			name={this.props ? this.props.name || this.props.id : ''}
			id={this.props ? this.props.id || this.props.name : ''}
			value={this.props ? this.props.value : undefined}
			rows={this.props ? this.props.rows : 5}
			disabled={this.props ? this.props.isDisabled : false}
			onBlur={this.handleFocusOut}
			onInput={this.handleInput} /> : <textarea
			key={this.props ? this.props.id || this.props.name : ''}
			className={styles.default + (this.props && this.props.isValid ? ' isValid' : '') + (this.props && this.props.isInvalid ? ' isInvalid' : '') + (this.props && this.props.isDisabled ? ' isDisabled' : ' isEnabled')}
			name={this.props ? this.props.name || this.props.id : ''}
			id={this.props ? this.props.id || this.props.name : ''}
			rows={this.props ? this.props.rows || 5 : 5}
			disabled={this.props ? this.props.isDisabled : false}
			onBlur={this.handleFocusOut}
			onInput={this.handleInput} />;
	}

	handleInput = (event: Event) => {
		if (this.props && this.props.handleChange) {
			this.props.handleChange(this.validate((event.target as any).value));
		}
	}

	handleFocusOut = (event: Event) => {
		if (this.props && this.props.handleSave) {
			this.props.handleSave(this.validate((event.target as any).value));
		}
	}
}
