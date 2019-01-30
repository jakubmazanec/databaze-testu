let encodeBase64;
if (global.btoa) {
    encodeBase64 = global.btoa;
} else {
    encodeBase64 = value => new Buffer(value).toString('base64');
}
export default encodeBase64;