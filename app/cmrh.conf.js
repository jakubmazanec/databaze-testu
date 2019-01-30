let path = require('path');
let loaderUtils = require('loader-utils');


module.exports = {
	generateScopedName: (name, filepath) => `${path.parse(filepath).name}__${name}__${loaderUtils.getHashDigest(`${path.join('build-next/', path.relative(path.join(__dirname, 'build-latest'), filepath))}+${name}`, 'md5', 'base64', 4)}`
};
