import styles from './Button.css';
import { createVNode } from 'inferno';
export default function ButtonGroup(props) {
    let alignClass;
    if (props && props.align === 'center') {
        alignClass = styles.hasCenterAlign;
    }
    return createVNode(2, 'div', styles.buttonGroup + (alignClass ? ` ${alignClass}` : ''), props.children);
}