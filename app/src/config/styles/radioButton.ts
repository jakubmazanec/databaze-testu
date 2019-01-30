import colors from './colors';
import text from './text';

import hexToRgbaString from '../../internals/hexToRgbaString';
import textInput from './textInput';


let radioButton: any = {};

radioButton.default = {
	color: textInput.default.color,
	backgroundColor: textInput.default.backgroundColor,
	borderColor: textInput.default.borderColor,
	borderWidth: textInput.default.borderWidth,
	borderRadius: textInput.default.borderRadius,
	boxShadow: textInput.default.boxShadow,
	fontSize: text.fontSize
};

radioButton.default.invalid = {
	color: textInput.default.invalid.color,
	backgroundColor: textInput.default.invalid.backgroundColor,
	borderColor: textInput.default.invalid.borderColor,
	boxShadow: textInput.default.invalid.boxShadow
};

radioButton.default.valid = {
	color: textInput.default.valid.color,
	backgroundColor: textInput.default.valid.backgroundColor,
	borderColor: textInput.default.valid.borderColor,
	boxShadow: textInput.default.valid.boxShadow
};

radioButton.default.focused = {
	color: textInput.default.focused.color,
	backgroundColor: textInput.default.focused.backgroundColor,
	borderColor: textInput.default.focused.borderColor,
	boxShadow: textInput.default.focused.boxShadow
};

radioButton.default.hovered = {
	color: textInput.default.hovered.color,
	backgroundColor: textInput.default.hovered.backgroundColor,
	borderColor: textInput.default.hovered.borderColor,
	boxShadow: textInput.default.hovered.boxShadow
};

radioButton.default.disabled = {
	color: textInput.default.disabled.color,
	backgroundColor: textInput.default.disabled.backgroundColor,
	borderColor: textInput.default.disabled.borderColor,
	boxShadow: textInput.default.disabled.boxShadow
};

export default radioButton;















