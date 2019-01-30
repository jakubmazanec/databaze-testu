import Component from 'inferno-component';
import styles from './Progress.css';
import { createVNode } from 'inferno';
export default class Progress extends Component {
    render() {
        if (!this.props) {
            return null;
        }
        return createVNode(2, 'progress', styles.root, createVNode(2, 'div', styles.fallback, null, {
            'style': { width: `${this.props.value / this.props.max * 100}%` }
        }), {
            'value': this.props.value,
            'max': this.props.max
        });
    }
}