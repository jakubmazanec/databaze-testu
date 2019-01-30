import Component from 'inferno-component';
export default class CreateMethodModal extends Component<{}, {}> {
    state: {
        name: string;
        shortName: string;
        localName: string;
        localShortName: string;
        description: string;
        tags: never[];
        authors: never[];
        source: string;
        isWaitingForResponse: boolean;
        isDoneMessageVisible: boolean;
    };
    refs: {
        root?: Element;
    };
    private onAppStateStream;
    private onLanguageStream;
    private onMethodsStream;
    componentDidMount(): void;
    componentDidUnmount(): void;
    render(): any;
    handleCloseClick: (event: Event) => void;
    handleCloseButtonClick: () => void;
    handleCreateMethodClick: () => void;
    handleNameChange: (name: string) => void;
    handleShortNameChange: (shortName: string) => void;
    handleLocalNameChange: (localName: string) => void;
    handleLocalShortNameChange: (localShortName: string) => void;
    handleDescriptionChange: (description: string) => void;
    handleTagsChange: (tags: string) => void;
    handleAuthorsChange: (authors: string) => void;
    handleSourceChange: (source: string) => void;
}
