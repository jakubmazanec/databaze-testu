import privateConfig from '../../../config/private.json';
import serverConfig from '../../../config/server.json';
import commonConfig, {CommonConfig} from '../common';


export interface ServerConfig extends CommonConfig {
	smtp: any;
	jwt: any;
	emails: any;
	tempDir: string;
	uploadsDir: string;
	dbDir: string;
}

let config: ServerConfig = Object.assign({}, commonConfig, serverConfig, privateConfig);

export default config;
