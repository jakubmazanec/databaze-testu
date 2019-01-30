import { CommonConfig } from '../common';
export interface ServerConfig extends CommonConfig {
    smtp: any;
    jwt: any;
    emails: any;
    tempDir: string;
    uploadsDir: string;
    dbDir: string;
}
declare let config: ServerConfig;
export default config;
