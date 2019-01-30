import Component from 'inferno-component';
import styles from './Textarea.css';
import { createVNode } from 'inferno';
export default class Textarea extends Component {
    constructor() {
        super(...arguments);
        this.handleInput = event => {
            if (this.props && this.props.handleChange) {
                this.props.handleChange(this.validate(event.target.value));
            }
        };
        this.handleFocusOut = event => {
            if (this.props && this.props.handleSave) {
                this.props.handleSave(this.validate(event.target.value));
            }
        };
    }
    validate(value) {
        return this.props && this.props.validator ? this.props.validator(value) : value;
    }
    render() {
        return this.props && typeof this.props.value !== 'undefined' ? createVNode(1024, 'textarea', styles.default + (this.props && this.props.isValid ? ' isValid' : '') + (this.props && this.props.isInvalid ? ' isInvalid' : '') + (this.props && this.props.isDisabled ? ' isDisabled' : ' isEnabled'), null, {
            'name': this.props ? this.props.name || this.props.id : '',
            'id': this.props ? this.props.id || this.props.name : '',
            'value': this.props ? this.props.value : undefined,
            'rows': this.props ? this.props.rows : 5,
            'disabled': this.props ? this.props.isDisabled : false,
            'onBlur': this.handleFocusOut,
            'onInput': this.handleInput
        }, this.props ? this.props.id || this.props.name : '') : createVNode(1024, 'textarea', styles.default + (this.props && this.props.isValid ? ' isValid' : '') + (this.props && this.props.isInvalid ? ' isInvalid' : '') + (this.props && this.props.isDisabled ? ' isDisabled' : ' isEnabled'), null, {
            'name': this.props ? this.props.name || this.props.id : '',
            'id': this.props ? this.props.id || this.props.name : '',
            'rows': this.props ? this.props.rows || 5 : 5,
            'disabled': this.props ? this.props.isDisabled : false,
            'onBlur': this.handleFocusOut,
            'onInput': this.handleInput
        }, this.props ? this.props.id || this.props.name : '');
    }
}