import Component from 'inferno-component';
import styles from './Spinner.css';
import { createVNode } from 'inferno';
export default class Spinner extends Component {
    render() {
        return createVNode(2, 'div', styles.root + (this.props && this.props.isVisible ? ` ${styles.isVisible}` : '') + (this.props && this.props.isInline ? ` ${styles.isInline}` : '') + (this.props && this.props.isAlternative ? ` ${styles.isAlternative}` : ''), createVNode(2, 'span', styles.spinner));
    }
}