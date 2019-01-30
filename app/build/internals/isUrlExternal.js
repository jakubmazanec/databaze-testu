const DOMAIN_REGEX = /https?:\/\/((?:[\w\d]+\.)+[\w\d]{2,})/i;
export default function isUrlExternal(url) {
    let testedDomain = DOMAIN_REGEX.exec(url);
    let localDomain = DOMAIN_REGEX.exec(location.href);
    if (!localDomain) {
        return true;
    }
    if (testedDomain && testedDomain[1]) {
        return testedDomain[1] !== localDomain[1];
    }
    return false;
}