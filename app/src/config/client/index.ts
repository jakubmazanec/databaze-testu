import clientConfig from '../../../config/client.json';
import commonConfig, {CommonConfig} from '../common';


export interface ClientConfig extends CommonConfig {
}

let config: ClientConfig = Object.assign({}, commonConfig, clientConfig);

export default config;
