import Component from 'inferno-component';
import styles from './Input.css';
const ENTER_KEY_CODE = 13;
import { createVNode } from 'inferno';
export default class Input extends Component {
    constructor() {
        super(...arguments);
        this.handleInput = event => {
            if (this.props && this.props.onChange) {
                this.props.onChange(this.validate(event.target.value));
            }
        };
        this.handleFocusOut = event => {
            if (this.props && this.props.onSave) {
                this.props.onSave(this.validate(event.target.value));
            }
        };
        this.handleKeyDown = event => {
            if (event.keyCode === ENTER_KEY_CODE) {
                if (this.props && this.props.onSave) {
                    this.props.onSave(this.validate(event.target.value));
                }
            }
        };
    }
    validate(value) {
        return this.props && this.props.validator ? this.props.validator(value) : value;
    }
    render() {
        return this.props && typeof this.props.value !== 'undefined' ? createVNode(512, 'input', styles.default + (this.props && this.props.isValid ? ' isValid' : '') + (this.props && this.props.isInvalid ? ' isInvalid' : '') + (this.props && this.props.isDisabled ? ' isDisabled' : ' isEnabled') + (this.props && this.props.isRequired ? ' isRequired' : ''), null, {
            'type': this.props ? this.props.type : 'text',
            'name': this.props ? this.props.name || this.props.id : '',
            'id': this.props ? this.props.id || this.props.name : '',
            'value': this.props ? this.props.value : undefined,
            'autoComplete': this.props ? this.props.autocomplete : false,
            'disabled': this.props ? this.props.isDisabled : false,
            'onBlur': this.handleFocusOut,
            'onInput': this.handleInput,
            'onKeyDown': this.handleKeyDown
        }, this.props ? this.props.id || this.props.name : '') : createVNode(512, 'input', styles.default + (this.props && this.props.isValid ? ' isValid' : '') + (this.props && this.props.isInvalid ? ' isInvalid' : '') + (this.props && this.props.isDisabled ? ' isDisabled' : ' isEnabled') + (this.props && this.props.isRequired ? ' isRequired' : ''), null, {
            'type': this.props ? this.props.type : 'text',
            'name': this.props ? this.props.name || this.props.id : '',
            'id': this.props ? this.props.id || this.props.name : '',
            'autoComplete': this.props ? this.props.autocomplete : false,
            'disabled': this.props ? this.props.isDisabled : false,
            'onBlur': this.handleFocusOut,
            'onInput': this.handleInput,
            'onKeyDown': this.handleKeyDown
        }, this.props ? this.props.id || this.props.name : '');
    }
}