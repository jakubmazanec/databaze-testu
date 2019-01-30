import Inferno from 'inferno';
import Component from 'inferno-component';

import styles from './RadioButton.css';


const ENTER_KEY_CODE = 13;

export interface RadioButtonProps {
	name: string;
	items: Array<{value: string; label: string; isChecked: boolean; isDisabled: boolean;}>;
	onChange?: (value: string | null) => void;
	validator?: (value: string) => string | null;
}

export default class RadioButton extends Component<RadioButtonProps, {}> {
	validate(value: string) {
		return this.props && this.props.validator ? this.props.validator(value) : value;
	}

	render() {
		let inputElements: Array<Element> = [];

		if (this.props.items && this.props.items.length) {
			this.props.items.forEach((item: any) => {
				inputElements.push(<input
					className={styles.default}
					id={`${this.props.name}-${item.value}`}
					name={this.props.name}
					type="radio"
					value={item.value}
					checked={item.isChecked}
					disabled={item.isDisabled}
					onChange={this.handleChange}
					onFocus={this.handleChange}
				/>);
				inputElements.push(<label	className={styles.label} htmlFor={`${this.props.name}-${item.value}`}>
					{`${item.label}`}
				</label>);
			});
		}

		return <div>
			{inputElements}
		</div>;
	}

	handleChange = (event: Event) => {
		let checkedItem;

		for (let i = 0; i < this.props.items.length; i++) {
			if (this.props.items[i].isChecked) {
				checkedItem = this.props.items[i];

				break;
			}
		}

		if (this.props && this.props.onChange && !(checkedItem && checkedItem.value === (event.target as any).value)) {
			this.props.onChange(this.validate((event.target as any).value));
		}
	}
}
