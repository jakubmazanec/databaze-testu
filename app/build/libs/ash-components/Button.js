import Component from 'inferno-component';
import styles from './Button.css';
import Icon from './Icon';
import Spinner from './Spinner';
const MAILTO_REGEX = /^mailto:/;
const ROUTE_LINK_REGEX = /^\//;
import { createVNode } from 'inferno';
export default class Button extends Component {
    constructor() {
        super(...arguments);
        this.handleClick = event => {
            if (this.props && !this.props.isDisabled && !(this.props.link || this.props.link && MAILTO_REGEX.test(this.props.link))) {
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
        };
    }
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
        let iconElements = [];
        if (this.props && this.props.icon) {
            iconElements.push(createVNode(16, Icon, null, null, {
                'href': this.props.iconHref,
                'id': this.props.icon
            }, 'icon'));
        }
        if (this.props && this.props.selectedIcon) {
            iconElements.push(createVNode(16, Icon, null, null, {
                'href': this.props.iconHref,
                'id': this.props.selectedIcon
            }, 'selectedIcon'));
        }
        let iconAfterElements = [];
        if (this.props && this.props.iconAfter) {
            iconAfterElements.push(createVNode(16, Icon, null, null, {
                'href': this.props.iconHref,
                'id': this.props.iconAfter
            }, 'iconAfter'));
        }
        if (this.props && this.props.selectedIconAfter) {
            iconAfterElements.push(createVNode(16, Icon, null, null, {
                'href': this.props.iconHref,
                'id': this.props.selectedIconAfter
            }, 'selectedIconAfter'));
        }
        let buttonElement = createVNode(2, 'button', buttonClass + (this.props && this.props.isDisabled ? ' isDisabled' : ' isEnabled') + (this.props && this.props.isFailed ? ' isFailed' : ''), [createVNode(2, 'span', styles.icon, iconElements), this.props && this.props.hasSpinner && this.props.isLoading ? createVNode(2, 'span', styles.spinner, createVNode(16, Spinner, null, null, {
            'isInline': true,
            'isVisible': true,
            'isAlternative': this.props.type !== 'flat' && this.props.type !== 'invisible'
        })) : null, this.props && this.props.label ? this.props.label : null, this.props && this.props.badge ? createVNode(2, 'span', styles.badge, this.props.badge) : null, createVNode(2, 'span', styles.iconAfter, iconAfterElements)], {
            'onClick': this.handleClick
        });
        if (this.props && this.props.isSubmit) {
            buttonElement = createVNode(512, 'input', buttonClass + (this.props.isDisabled ? ' isDisabled' : ' isEnabled'), null, {
                'type': 'submit',
                'name': this.props.name || this.props.id || '',
                'id': this.props.id || this.props.name || '',
                'value': this.props.label || '',
                'onClick': this.handleClick
            });
        } else if (this.props && this.props.link) {
            buttonElement = createVNode(2, 'a', buttonClass + (this.props.isDisabled ? ' isDisabled' : ' isEnabled'), [createVNode(2, 'span', styles.icon, iconElements), this.props.label || null, this.props.badge ? createVNode(2, 'span', styles.badge, this.props.badge) : null, createVNode(2, 'span', styles.iconAfter, iconAfterElements)], {
                'href': this.props.link ? this.props.link : '#',
                'target': !this.props.isDisabled && this.props.link && ROUTE_LINK_REGEX.test(this.props.link) && this.props.useRouter !== false ? '' : '_blank',
                'onClick': this.handleClick
            });
        }
        return buttonElement;
    }
}