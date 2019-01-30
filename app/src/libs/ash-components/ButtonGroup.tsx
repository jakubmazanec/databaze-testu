import Inferno from 'inferno';

import styles from './Button.css';


export interface ButtonGroupProps {
	align?: string;
	children?: any;
}

export default function ButtonGroup(props: ButtonGroupProps) {
	let alignClass;

	if (props && props.align === 'center') {
		alignClass = styles.hasCenterAlign;
	}

	return <div className={styles.buttonGroup + (alignClass ? ` ${alignClass}` : '')}>{props.children}</div>;
}
