import fs from 'fs';
import path from 'path';
import Bluebird from 'bluebird';
import appRoot from '../internals/appRoot';
let readFile = Bluebird.promisify(fs.readFile);
export default (async function loadHtmlTemplate(filename) {
    let result = '';
    try {
        result = await readFile(path.join(appRoot, filename), { encoding: 'utf-8' });
    } catch (error) {
        console.log(error);
    }
    return result;
});