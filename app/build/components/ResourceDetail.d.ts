import Component from 'inferno-component';
import Resource, { ResourceType } from '../types/Resource';
export interface ResourceDetailProps {
    resource: Resource | null;
}
export default class ResourceDetail extends Component<ResourceDetailProps, {}> {
    state: {
        isEditingModeOn: boolean;
        isWaitingForResponse: boolean;
        isDoneMessageVisible: boolean;
        type: ResourceType;
        name: string;
        description: string;
    };
    private onAppStateStream;
    private onLanguageStream;
    private onUsersStream;
    private onMethodsStream;
    private onResourcesStream;
    componentDidMount(): void;
    componentDidUnmount(): void;
    render(): any;
    handleEditResourceClick: () => void;
    handleSaveChangesClick: () => void;
    handleDiscardChangesClick: () => void;
    handleNameChange: (name: string) => void;
    handleTypeChange: (type: string) => void;
    handleDescriptionChange: (description: string) => void;
}
