import createTemplateVariableRegExp from '../internals/createTemplateVariableRegExp';
export default function replaceStringVariables(value, variables) {
    let variableNames = Object.keys(variables);
    let newValue = value;
    variableNames.forEach(variableName => {
        newValue = newValue.replace(createTemplateVariableRegExp(variableName), variables[variableName]);
    });
    return newValue;
}