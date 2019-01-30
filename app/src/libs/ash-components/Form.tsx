import Inferno from 'inferno';


export interface FormProps {
	className?: string;
	children?: any;
}

export default function Form(props: FormProps) {
	let formProps: {className?: string} = {};

	if (props.className) {
		formProps.className = props.className;
	}

	return <form {...formProps}>{props.children}</form>;
}
