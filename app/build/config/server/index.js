import privateConfig from '../../../config/private.json';
import serverConfig from '../../../config/server.json';
import commonConfig from '../common';
let config = Object.assign({}, commonConfig, serverConfig, privateConfig);
export default config;