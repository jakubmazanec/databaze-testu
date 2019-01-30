import Component from 'inferno-component';
export interface FilesProps {
    id: string;
    name?: string;
    handleChange: (files: Array<File>) => void;
}
export default class Files extends Component<FilesProps, {}> {
    state: {
        isDropzoneActive: boolean;
    };
    render(): any;
    handleDragEnter: (event: Event) => void;
    handleDragLeave: (event: Event) => void;
    handleDragOver: (event: Event) => void;
    handleDrop: (event: Event) => void;
    handleChange: (event: Event) => void;
    selectFiles: (fileList: File[]) => void;
}
