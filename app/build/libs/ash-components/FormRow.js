import styles from './FormRow.css';
import { createVNode } from 'inferno';
export default function FormRow(props) {
	let labelElement = props.id ? createVNode(2, 'label', null, `${props.label}`, {
		'for': props.id
	}) : createVNode(2, 'label', null, `${props.label}`);
	return createVNode(2, 'div', styles.root + (props.className ? ` ${props.className}` : ''), [props.label ? createVNode(2, 'div', styles.label, [labelElement, props.hint ? createVNode(2, 'span', styles.hint, props.hint) : null]) : null, createVNode(2, 'div', styles.fields, [props.children, createVNode(2, 'div', styles.errorMessage + (props.showError ? ' ${styles.isVisible}' : ''), props.errorMessage || null)])]);
}