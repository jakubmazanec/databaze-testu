import colors from './colors';
import text from './text';
import hexToRgbaString from '../../internals/hexToRgbaString';
let textInput = {};
textInput.default = {
    color: colors.text,
    backgroundColor: colors.background,
    borderColor: colors.neutral.shade[2],
    borderWidth: 2,
    borderRadius: '0.125bh',
    boxShadow: `inset 0 0.0625bh 0.0625bh ${hexToRgbaString(colors.neutral.shade[4], 0.15)}`,
    fontSize: text.fontSize,
    placeholder: {
        color: colors.neutral.shade[1]
    }
};
textInput.default.invalid = {
    color: textInput.default.color,
    backgroundColor: textInput.default.backgroundColor,
    borderColor: colors.negative.base,
    boxShadow: textInput.default.boxShadow,
    placeholder: {
        color: textInput.default.placeholder.color
    }
};
textInput.default.valid = {
    color: textInput.default.color,
    backgroundColor: textInput.default.backgroundColor,
    borderColor: colors.positive.base,
    boxShadow: textInput.default.boxShadow,
    placeholder: {
        color: textInput.default.placeholder.color
    }
};
textInput.default.focused = {
    color: textInput.default.color,
    backgroundColor: textInput.default.backgroundColor,
    borderColor: colors.secondary1.base,
    boxShadow: textInput.default.boxShadow,
    placeholder: {
        color: textInput.default.placeholder.color
    }
};
textInput.default.hovered = {
    color: textInput.default.color,
    backgroundColor: textInput.default.backgroundColor,
    borderColor: colors.secondary1.tint[1],
    boxShadow: textInput.default.boxShadow,
    placeholder: {
        color: textInput.default.placeholder.color
    }
};
textInput.default.disabled = {
    color: colors.neutral.tint[2],
    backgroundColor: textInput.default.backgroundColor,
    borderColor: colors.neutral.tint[2],
    boxShadow: `inset 0 0.0625bh 0.0625bh ${hexToRgbaString(colors.neutral.shade[4], 0.1)}`,
    placeholder: {
        color: colors.neutral.tint[2]
    }
};
export default textInput;