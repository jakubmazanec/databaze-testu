export declare enum OpenModal {
    none = "NONE",
    createMethod = "CREATE_METHOD",
    createResource = "CREATE_RESOURCE",
}
export default interface AppState {
    openModal: OpenModal;
    createResourceModalMethodUuid?: string;
}
