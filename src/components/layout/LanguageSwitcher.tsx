import { useTranslation } from 'react-i18next'
import { supportedLanguages } from '@/i18n'
import { cn } from '@/utils/cn'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const currentLanguage = i18n.resolvedLanguage ?? i18n.language

  return (
    <div
      role="group"
      aria-label={t('header.language')}
      className="flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5"
    >
      {supportedLanguages.map((language) => (
        <button
          key={language.code}
          type="button"
          title={language.name}
          onClick={() => {
            void i18n.changeLanguage(language.code)
          }}
          className={cn(
            'rounded-md px-2 py-1 text-xs font-semibold transition-colors',
            currentLanguage === language.code
              ? 'bg-blue-600 text-white'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          {language.label}
        </button>
      ))}
    </div>
  )
}