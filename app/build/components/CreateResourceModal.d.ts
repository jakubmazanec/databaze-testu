import Component from 'inferno-component';
import { ResourceType } from '../types/Resource';
export interface CreateResourceModalProps {
    isOpen: boolean;
    methodUuid?: string;
}
export default class CreateResourceModal extends Component<CreateResourceModalProps, {}> {
    state: {
        type: ResourceType;
        name: string;
        description: string;
        isWaitingForResponse: boolean;
        isDoneMessageVisible: boolean;
    };
    refs: {
        root?: Element;
    };
    private onAppStateStream;
    private onLanguageStream;
    private onMethodsStream;
    private onResourcesStream;
    componentDidMount(): void;
    componentDidUnmount(): void;
    render(): any;
    handleCloseClick: (event: Event) => void;
    handleCloseButtonClick: () => void;
    handleCreateResourceClick: () => void;
    handleTypeChange: (type: string) => void;
    handleNameChange: (name: string) => void;
    handleDescriptionChange: (description: string) => void;
}
