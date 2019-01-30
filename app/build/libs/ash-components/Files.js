import Component from 'inferno-component';
import styles from './Files.css';
import { createVNode } from 'inferno';
export default class Files extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            isDropzoneActive: false
        };
        this.handleDragEnter = event => {
            event.preventDefault();
            this.setState({ isDropzoneActive: true });
        };
        this.handleDragLeave = event => {
            event.preventDefault();
            this.setState({ isDropzoneActive: false });
        };
        this.handleDragOver = event => {
            event.preventDefault();
        };
        this.handleDrop = event => {
            event.preventDefault();
            this.selectFiles(event.dataTransfer.files);
            this.setState({ isDropzoneActive: false });
        };
        this.handleChange = event => {
            this.selectFiles(event.target.files);
        };
        this.selectFiles = fileList => {
            let files = [];
            for (let i = 0; i < fileList.length; i++) {
                files.push(fileList[i]);
            }
            if (this.props && fileList && fileList.length) {
                this.props.handleChange(files);
            }
        };
    }
    render() {
        return createVNode(2, 'div', styles.root + (this.state.isDropzoneActive ? ` ${styles.isActive}` : ''), [createVNode(512, 'input', styles.input, null, {
            'name': this.props ? this.props.name || this.props.id : '',
            'id': this.props ? this.props.id || this.props.name : '',
            'multiple': true,
            'type': 'file',
            'onChange': this.handleChange
        }), createVNode(2, 'label', styles.button, 'Select files', {
            'for': this.props ? this.props.id || this.props.name : ''
        }), createVNode(2, 'label', styles.label, 'or drag & drop them here\u2026', {
            'for': this.props ? this.props.id || this.props.name : ''
        })], {
            'onDragEnter': this.handleDragEnter,
            'onDragLeave': this.handleDragLeave,
            'onDragOver': this.handleDragOver,
            'onDrop': this.handleDrop
        });
    }
}