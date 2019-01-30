export default function createTemplateVariableRegExp(variableName: string): RegExp {
	return new RegExp(`\{\{\s*${variableName}\s*\}\}`, 'g');
}
