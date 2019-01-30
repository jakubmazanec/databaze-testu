import styles from '../styles';
import i18nStrings from '../i18nStrings';
import * as commonConfig from '../../../config/common.json';
let config = Object.assign({}, commonConfig, {
    styles,
    i18nStrings,
    urlRoot: process.env.NODE_ENV === 'production' ? '/' : '/' // should be e.g. `/` or `/root`
});
export default config;