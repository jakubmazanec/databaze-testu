import isUrlExternal from './isUrlExternal';
const DOMAIN_REGEX = /https?:\/\/((?:[\w\d]+\.)+[\w\d]{2,})/i;
export default function isUrlInternal(url) {
    return !!(url && (!DOMAIN_REGEX.test(url) || !isUrlExternal(url)));
}