import colors from './colors';
import typographicScale from './typographicScale';
import grid from './grid';
let text = {
    color: colors.text,
    backgroundColor: colors.background,
    fontSize: typographicScale.base,
    lineHeight: grid.baselineHeight / typographicScale.base,
    fontWeight: 'normal',
    fontFeatures: `'kern', 'liga', 'clig', 'calt', 'onum', 'pnum'`,
    fontFamily: `Brandon Text, Frutiger, 'Frutiger Linotype', Univers, Calibri, 'Gill Sans', 'Gill Sans MT', 'Myriad Pro', Myriad, 'DejaVu Sans Condensed', 'Liberation Sans', 'Nimbus Sans L', Tahoma, Geneva, 'Helvetica Neue', Helvetica, Arial, sans-serif`,
    selection: {
        color: colors.background,
        backgroundColor: colors.secondary2.base
    }
};
export default text;