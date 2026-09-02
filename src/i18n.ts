import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import ru from '@/locales/ru.json'
import en from '@/locales/en.json'
import uz from '@/locales/uz.json'

// Один список языков на всё приложение.
export const supportedLanguages = [
  { code: 'ru', label: 'RU', name: 'Русский' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'uz', label: 'UZ', name: "O'zbekcha" },
] as const

i18n
  // Сам определяет язык: сначала смотрит сохранённый выбор, потом язык браузера.
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
      uz: { translation: uz },
    },
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'en', 'uz'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'pft-language',
      caches: ['localStorage'],
    },
  })

// Атрибут lang на странице должен совпадать с выбранным языком:
// по нему браузер выбирает правила переноса слов, а программы
// чтения с экрана — произношение. Держим его в одном месте,
// чтобы переключатель языка не пришлось об этом помнить.
function syncDocumentLanguage(language: string) {
  document.documentElement.lang = language
}

syncDocumentLanguage(i18n.resolvedLanguage ?? 'ru')
i18n.on('languageChanged', syncDocumentLanguage)

export default i18n