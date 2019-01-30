import clientConfig from '../../../config/client.json';
import commonConfig from '../common';
let config = Object.assign({}, commonConfig, clientConfig);
export default config;