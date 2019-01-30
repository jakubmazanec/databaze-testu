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
declare let config: CommonConfig;
export default config;
