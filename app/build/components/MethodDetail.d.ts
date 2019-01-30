import Component from 'inferno-component';
import Method from '../types/Method';
export interface MethodDetailProps {
    method: Method | null;
}
export default class MethodDetail extends Component<MethodDetailProps, {}> {
    state: {
        isEditingModeOn: boolean;
        isWaitingForResponse: boolean;
        isDoneMessageVisible: boolean;
        name: string;
        shortName: string;
        localName: string;
        localShortName: string;
        description: string;
        tags: string[];
        authors: string[];
        source: string;
    };
    private onAppStateStream;
    private onLanguageStream;
    private onUsersStream;
    private onMethodsStream;
    private onResourcesStream;
    componentDidMount(): void;
    componentDidUnmount(): void;
    render(): any;
    handleEditMethodClick: () => void;
    handleSaveChangesClick: () => void;
    handleDiscardChangesClick: () => void;
    handleCreateResourceClick: () => void;
    handleNameChange: (name: string) => void;
    handleShortNameChange: (shortName: string) => void;
    handleLocalNameChange: (localName: string) => void;
    handleLocalShortNameChange: (localShortName: string) => void;
    handleDescriptionChange: (description: string) => void;
    handleTagsChange: (tags: string) => void;
    handleAuthorsChange: (authors: string) => void;
    handleSourceChange: (source: string) => void;
}
