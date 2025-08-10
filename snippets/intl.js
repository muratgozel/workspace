import { createIntl, createIntlCache } from "@formatjs/intl";

const cache = createIntlCache();

const intl = {
    en: {
        intl: createIntl({
            locale: 'en',
            messages: {
                error_unexpected: 'An unexpected error occurred. Try again later, please.'
            }
        }, cache)
    },
    tr: {
        intl: createIntl({
            locale: 'tr',
            messages: {
                error_unexpected: "Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
            }
        }, cache)
    }
}

export function configure(locale) {
    return (id, values) => {
        (locale in intl ? intl[locale] : intl.en).intl.formatMessage({ id }, values)
    }
}

const sample = configure('en')
console.log(sample('error_unexpected'))
