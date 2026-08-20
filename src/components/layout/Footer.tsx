import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 px-4 py-4 sm:px-6">
      <p className="text-xs text-slate-400">
        © {year} {t('app.name')} · {t('footer.project')}
      </p>
    </footer>
  )
}