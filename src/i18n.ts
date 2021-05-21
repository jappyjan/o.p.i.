import {createI18n, I18n} from 'vue-i18n';
import {nextTick, Ref} from 'vue';

export const SUPPORT_LOCALES = ['en', 'de'];
const DEFAULT_LOCALE = 'en';

let i18n: I18n<unknown, unknown, unknown, boolean>;

export function getI18n(): I18n<unknown, unknown, unknown, boolean> {
    if (!i18n) {
        i18n = createI18n({
            locale: DEFAULT_LOCALE,
            fallbackLocale: DEFAULT_LOCALE,
        });
    }
    setI18nLanguage(DEFAULT_LOCALE);
    setUiLang(DEFAULT_LOCALE);
    return i18n;
}

export function setI18nLanguage(locale: string): void {
    if (i18n.mode === 'legacy') {
        i18n.global.locale = locale;
    } else {
      (i18n.global.locale as unknown as Ref).value = locale;
    }

    /**
     * NOTE:
     * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
     * The following is an example for axios.
     *
     * axios.defaults.headers.common['Accept-Language'] = locale
     */
    document.querySelector('html')!.setAttribute('lang', locale);
}

export async function setUiLang(locale: string): Promise<void> {
    // load locale messages with dynamic import
    const messages = await import(/* webpackChunkName: "locale-[request]" */ `./locales/${locale}.json`);

    // set locale and locale message
    i18n.global.setLocaleMessage(locale, messages.default);

    return nextTick();
}
