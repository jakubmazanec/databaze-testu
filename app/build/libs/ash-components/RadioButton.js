import Component from 'inferno-component';
import styles from './RadioButton.css';
const ENTER_KEY_CODE = 13;
import { createVNode } from 'inferno';
export default class RadioButton extends Component {
    constructor() {
        super(...arguments);
        this.handleChange = event => {
            let checkedItem;
            for (let i = 0; i < this.props.items.length; i++) {
                if (this.props.items[i].isChecked) {
                    checkedItem = this.props.items[i];
                    break;
                }
            }
            if (this.props && this.props.onChange && !(checkedItem && checkedItem.value === event.target.value)) {
                this.props.onChange(this.validate(event.target.value));
            }
        };
    }
    validate(value) {
        return this.props && this.props.validator ? this.props.validator(value) : value;
    }
    render() {
        let inputElements = [];
        if (this.props.items && this.props.items.length) {
            this.props.items.forEach(item => {
                inputElements.push(createVNode(512, 'input', styles.default, null, {
                    'id': `${this.props.name}-${item.value}`,
                    'name': this.props.name,
                    'type': 'radio',
                    'value': item.value,
                    'checked': item.isChecked,
                    'disabled': item.isDisabled,
                    'onChange': this.handleChange,
                    'onFocus': this.handleChange
                }));
                inputElements.push(createVNode(2, 'label', styles.label, `${item.label}`, {
                    'for': `${this.props.name}-${item.value}`
                }));
            });
        }
        return createVNode(2, 'div', null, inputElements);
    }
}