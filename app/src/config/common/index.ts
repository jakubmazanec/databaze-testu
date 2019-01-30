import styles from '../styles';
import i18nStrings from '../i18nStrings';
import * as commonConfig from '../../../config/common.json';


export interface CommonConfig {
	appName: string;
	appDescription: string;
	developerName: string;
	developerUrl: string;
	themeColor: string;
	backgroundColor: string;
	version: string;

	styles: any;
	i18nStrings: any;
	urlRoot: string;
}

let config: CommonConfig = Object.assign({}, commonConfig, {
	styles,
	i18nStrings,
	urlRoot: process.env.NODE_ENV === 'production' ? '/' : '/' // should be e.g. `/` or `/root`
});

export default config;
