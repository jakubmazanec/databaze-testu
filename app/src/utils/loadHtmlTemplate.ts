import fs from 'fs';
import path from 'path';
import Bluebird from 'bluebird';

import appRoot from '../internals/appRoot';


let readFile: (file: string, options: object | string) => Promise<any> = Bluebird.promisify(fs.readFile) as (...all: any[]) => any;

export default async function loadHtmlTemplate(filename: string) {
	let result = '';

	try {
		result = await readFile(path.join(appRoot, filename), {encoding: 'utf-8'});
	} catch (error) {
		console.log(error);
	}


	return result;
}
