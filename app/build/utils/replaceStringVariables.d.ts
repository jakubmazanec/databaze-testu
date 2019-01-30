export interface Variables {
    [key: string]: string;
}
export default function replaceStringVariables(value: string, variables: Variables): string;
