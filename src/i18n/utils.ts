import es from './es.json'
import en from './en.json'
import zh from './zh.json'

const translations = { es, en, zh } as const

export type Locale = keyof typeof translations
export const LOCALES: Locale[] = ['es', 'en', 'zh']

export function useTranslations(locale: string) {
  return translations[locale as Locale] ?? translations.es
}
