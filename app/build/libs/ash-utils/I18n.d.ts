/**
 * I18n class.
 * Singleton.
 */
export default class I18n {
    private strings;
    private currency;
    locale: string;
    /**
     * Creates an I18n instance.
     *
     * @returns {I18n}
     */
    constructor();
    /**
     * Changes localization options.
     *
     * @param {Object} options
     * @param {Object} options.strings
     * @param {string} options.currency
     * @param {string} options.locale
     * @returns {this}
     */
    use({strings, currency, locale}?: {
        strings?: {};
        currency?: string;
        locale?: string;
    }): this;
    /**
     * Tag function for template string. Uses i18n instance localization options for translation.
     *
     * @param {Array<string>} literals
     * @param {...*} values
     * @returns {string}
     */
    translate(literals: Array<string>, ...values: Array<any>): string;
    getTranslationString(translationKey: string): any;
}
