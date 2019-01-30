export declare class LocalStore {
    clear(): void;
    contains(key: string): boolean;
    keys(): string[];
    get(key: string, defaultValue?: any): any;
    getRemainingSpace(): number;
    getSize(): number;
    isEmpty(): boolean;
    remove(key: string | Array<string>): void;
    set(key: string, value: any): void;
}
declare const _default: LocalStore;
export default _default;
