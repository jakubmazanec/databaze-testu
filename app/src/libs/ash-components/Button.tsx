import Inferno from 'inferno';
import Component from 'inferno-component';
import {BrowserRouter} from '../ash-utils';

import styles from './Button.css';
import Icon from './Icon';
import Spinner from './Spinner';


const MAILTO_REGEX = /^mailto:/;
const ROUTE_LINK_REGEX = /^\//;

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
	render() {
		let buttonClass = styles.default;

		if (this.props && this.props.type === 'flat') {
			buttonClass = styles.flat;
		} else if (this.props && this.props.type === 'invisible') {
			buttonClass = styles.invisible;
		}

		if (this.props && this.props.size === 'small') {
			buttonClass += ' isSmall';
		} else if (this.props && this.props.size === 'large') {
			buttonClass += ' isLarge';
		}

		buttonClass += this.props && this.props.isSelected ? ' isSelected' : '';

		buttonClass += this.props && (this.props.icon || this.props.selectedIcon) ? ' hasIcon' : '';
		buttonClass += this.props && this.props.selectedIcon ? ' hasSelectableIcon' : '';
		buttonClass += this.props && (this.props.iconAfter || this.props.selectedIconAfter) ? ' hasIconAfter' : '';
		buttonClass += this.props && (this.props.icon || this.props.selectedIcon || this.props.iconAfter || this.props.selectedIconAfter) && !this.props.label && !this.props.badge ? ' hasOnlyIcon' : '';

		let iconElements: Array<Element> = [];

		if (this.props && this.props.icon) {
			iconElements.push(<Icon href={this.props.iconHref} key="icon" id={this.props.icon} />);
		}

		if (this.props && this.props.selectedIcon) {
			iconElements.push(<Icon href={this.props.iconHref} key="selectedIcon" id={this.props.selectedIcon} />);
		}

		let iconAfterElements: Array<Element> = [];

		if (this.props && this.props.iconAfter) {
			iconAfterElements.push(<Icon href={this.props.iconHref} key="iconAfter" id={this.props.iconAfter} />);
		}

		if (this.props && this.props.selectedIconAfter) {
			iconAfterElements.push(<Icon href={this.props.iconHref} key="selectedIconAfter" id={this.props.selectedIconAfter} />);
		}

		let buttonElement = <button
			className={buttonClass + (this.props && this.props.isDisabled ? ' isDisabled' : ' isEnabled') + (this.props && this.props.isFailed ? ' isFailed' : '')}
			onClick={this.handleClick}>
			<span className={styles.icon}>{iconElements}</span>
			{this.props && this.props.hasSpinner && this.props.isLoading ? <span className={styles.spinner}><Spinner isInline={true} isVisible={true} isAlternative={this.props.type !== 'flat' && this.props.type !== 'invisible'} /></span> : null}
			{this.props && this.props.label ? this.props.label : null}
			{this.props && this.props.badge ? <span className={styles.badge}>{this.props.badge}</span> : null}
			<span className={styles.iconAfter}>{iconAfterElements}</span>
		</button>;

		if (this.props && this.props.isSubmit) {
			buttonElement = <input
				className={buttonClass + (this.props.isDisabled ? ' isDisabled' : ' isEnabled')}
				type="submit"
				name={this.props.name || this.props.id || ''}
				id={this.props.id || this.props.name || ''}
				value={this.props.label || ''}
				onClick={this.handleClick}
			/>;
		} else if (this.props && this.props.link) {
			buttonElement = <a
				className={buttonClass + (this.props.isDisabled ? ' isDisabled' : ' isEnabled')}
				href={this.props.link ? this.props.link : '#'}
				target={!this.props.isDisabled && this.props.link && ROUTE_LINK_REGEX.test(this.props.link) && this.props.useRouter !== false ? '' : '_blank'}
				onClick={this.handleClick}>
				<span className={styles.icon}>{iconElements}</span>
				{this.props.label || null}
				{this.props.badge ? <span className={styles.badge}>{this.props.badge}</span> : null}
				<span className={styles.iconAfter}>{iconAfterElements}</span>
			</a>;
		}

		return buttonElement;
	}

	handleClick = (event: Event) => {
		if (this.props && !this.props.isDisabled && !(this.props.link || (this.props.link && MAILTO_REGEX.test(this.props.link)))) {
			event.preventDefault();

			if (this.props.onClick) {
				this.props.onClick();
			}
		} else if (this.props && !this.props.isDisabled && this.props.link && ROUTE_LINK_REGEX.test(this.props.link) && this.props.useRouter !== false && this.props.router) {
			event.preventDefault();

			this.props.router.navigate(this.props.link);
		} else if (this.props && this.props.isDisabled) {
			event.preventDefault();
		}
	}
}
