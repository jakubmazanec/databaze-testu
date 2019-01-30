import Inferno from 'inferno';

import styles from './FormRow.css';


export interface FormRowProps {
	id?: string;
	label?: string;
	hint?: string;
	showError?: string;
	errorMessage?: string;
	className?: string;
	children?: any;
}

export default function FormRow(props: FormRowProps) {
	let labelElement = props.id ? <label htmlFor={props.id}>{`${props.label}`}</label> : <label>{`${props.label}`}</label>;

	return <div className={styles.root + (props.className ? ` ${props.className}` : '')}>
		{props.label ? <div className={styles.label}>
			{labelElement}
			{props.hint ? <span className={styles.hint}>{props.hint}</span> : null}
		</div> : null}
		<div className={styles.fields}>
			{props.children}
			<div className={styles.errorMessage + (props.showError ? ' ${styles.isVisible}' : '')}>{props.errorMessage || null}</div>
		</div>
	</div>;
}
