let decodeBase64;
if (global.btoa) {
    decodeBase64 = global.atob;
} else {
    decodeBase64 = value => new Buffer(value, 'base64').toString();
}
export default decodeBase64;