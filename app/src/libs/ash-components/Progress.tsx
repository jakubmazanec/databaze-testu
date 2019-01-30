import Inferno from 'inferno';
import Component from 'inferno-component';

import styles from './Progress.css';


export interface ProgressProps {
	value: number;
	max: number;
}

export default class Progress extends Component<{}, {}> {
	render() {
		if (!this.props) {
			return null;
		}

		return <progress className={styles.root} value={this.props.value} max={this.props.max}>
			<div className={styles.fallback} style={{width: `${this.props.value / this.props.max * 100}%`}}></div>
		</progress>;
	}
}
