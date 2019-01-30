import Inferno from 'inferno';
import Component from 'inferno-component';

import styles from './Spinner.css';


export interface SpinnerProps {
	isVisible: boolean;
	isInline: boolean;
	isAlternative: boolean;
}

export default class Spinner extends Component<SpinnerProps, {}> {
	render() {
		return <div className={styles.root + (this.props && this.props.isVisible ? ` ${styles.isVisible}` : '') + (this.props && this.props.isInline ? ` ${styles.isInline}` : '') + (this.props && this.props.isAlternative ? ` ${styles.isAlternative}` : '')}>
			<span className={styles.spinner}></span>
		</div>;
	}
}
