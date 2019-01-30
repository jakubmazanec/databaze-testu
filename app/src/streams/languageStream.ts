import moment from 'moment';
import {I18n, Stream} from '../libs/ash-utils';

import routeStream from './routeStream';
import constants from '../internals/constants';
import config from '../config/client';


const CS_CZ = constants.CS_CZ;
const SK_SK = constants.SK_SK;
const CS = constants.CS;
const SK = constants.SK;

export interface LanguageStreamValue {
	previous: string | null;
	current: string | null;
}

// init i18n
let i18n = new I18n();

(global as any).i18n = i18n;

moment.locale(CS);
i18n.use({
	strings: config.i18nStrings,
	locale: CS_CZ,
	currency: 'CZK'
});

let languageStram: Stream<LanguageStreamValue> = new Stream({
	previous: null,
	current: null
});

(global as any).languageStram = languageStram;

languageStram.combine((self, changed, dependency) => {
	let value = self.value;
	let {language} = dependency.value;

	if (language !== value.current && (language === CS_CZ || language === SK_SK)) {
		let newValue = {
			current: language,
			previous: value.current
		};

		if (language === CS_CZ) {
			moment.locale(CS);
			i18n.use({
				strings: config.i18nStrings,
				locale: CS_CZ,
				currency: 'CZK'
			});
		} else if (language === SK_SK) {
			moment.locale(SK);
			i18n.use({
				strings: config.i18nStrings,
				locale: SK_SK,
				currency: 'EUR'
			});
		}

		self.push(newValue);
	}
}, routeStream);

export default languageStram;
