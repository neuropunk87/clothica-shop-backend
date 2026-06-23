import i18next from 'i18next';
import i18nextMiddleware from 'i18next-http-middleware';
import Backend from 'i18next-fs-backend';

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: 'src/locales/{{lng}}/translation.json',
    },
    fallbackLng: 'uk',
    preload: ['uk', 'en'],
    supportedLngs: ['uk', 'en'],
    cleanCode: true,
    detection: {
      order: ['header', 'querystring'],
      caches: [],
      lookupHeader: 'accept-language',
    },
  });

export default i18next;
