import createTemplateVariableRegExp from '../internals/createTemplateVariableRegExp';


export interface Variables {
	[key: string]: string;
}

export default function replaceStringVariables(value: string, variables: Variables): string {
	let variableNames = Object.keys(variables);
	let newValue = value;

	variableNames.forEach((variableName) => {
		newValue = newValue.replace(createTemplateVariableRegExp(variableName), variables[variableName]);
	});

	return newValue;
}
