import es from './es.json'
import en from './en.json'
import zh from './zh.json'

const translations = { es, en, zh } as const

export type Locale = keyof typeof translations

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中文' },
]

export function useTranslations(locale: string) {
  return translations[locale as Locale] ?? translations.es
}
