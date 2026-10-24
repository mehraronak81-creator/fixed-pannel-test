import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import I18NextHttpBackend, { HttpBackendOptions } from 'i18next-http-backend';
import I18NextMultiloadBackendAdapter from 'i18next-multiload-backend-adapter';
import LanguageDetector from 'i18next-browser-languagedetector';

// Use the webpack build hash for cache-busting, with a per-reload value during HMR.
const hash = module.hot ? Date.now().toString(16) : process.env.WEBPACK_BUILD_HASH;

i18n.use(I18NextMultiloadBackendAdapter)
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        detection: {
            order: ['localStorage'],
            caches: ['localStorage'],
        },
        debug: process.env.DEBUG === 'true',
        fallbackLng: 'en',
        keySeparator: '.',
        backend: {
            backend: I18NextHttpBackend,
            backendOption: {
                loadPath: '/locales/locale.json?locale={{lng}}&namespace={{ns}}',
                queryStringParams: { hash },
                allowMultiLoading: true,
            } as HttpBackendOptions,
        } as Record<string, unknown>,
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;