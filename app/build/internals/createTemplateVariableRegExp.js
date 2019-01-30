export default function createTemplateVariableRegExp(variableName) {
    return new RegExp(`\{\{\s*${variableName}\s*\}\}`, 'g');
}