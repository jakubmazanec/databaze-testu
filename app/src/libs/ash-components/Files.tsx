import Inferno from 'inferno';
import Component from 'inferno-component';

import styles from './Files.css';


export interface FilesProps {
	id: string;
	name?: string;
	handleChange: (files: Array<File>) => void;
}

export default class Files extends Component<FilesProps, {}> {
	state = {
		isDropzoneActive: false
	};

	render() {
		return <div
			className={styles.root + (this.state.isDropzoneActive ? ` ${styles.isActive}` : '')}
			onDragEnter={this.handleDragEnter}
			onDragLeave={this.handleDragLeave}
			onDragOver={this.handleDragOver}
			onDrop={this.handleDrop}
		>
			<input
				className={styles.input}
				name={this.props ? this.props.name || this.props.id : ''}
				id={this.props ? this.props.id || this.props.name : ''}
				multiple={true}
				type="file"
				onChange={this.handleChange}
			/>
			<label htmlFor={this.props ? this.props.id || this.props.name : ''} className={styles.button}>Select files</label>
			<label htmlFor={this.props ? this.props.id || this.props.name : ''} className={styles.label}>or drag &amp; drop them here&hellip;</label>
		</div>;
	}

	handleDragEnter = (event: Event) => {
		event.preventDefault();

		this.setState({isDropzoneActive: true});
	}

	handleDragLeave = (event: Event) => {
		event.preventDefault();

		this.setState({isDropzoneActive: false});
	}

	handleDragOver = (event: Event) => {
		event.preventDefault();
	}

	handleDrop = (event: Event) => {
		event.preventDefault();

		this.selectFiles((event as any).dataTransfer.files);
		this.setState({isDropzoneActive: false});
	}

	handleChange = (event: Event) => {
		this.selectFiles((event.target as any).files);
	}

	selectFiles = (fileList: Array<File>) => {
		let files: Array<File> = [];

		for (let i = 0; i < fileList.length; i++) {
			files.push(fileList[i]);
		}

		if (this.props && fileList && fileList.length) {
			this.props.handleChange(files);
		}
	}
}
