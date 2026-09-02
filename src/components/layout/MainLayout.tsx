import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'

export function MainLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const { t } = useTranslation()
  // Просьба системы убрать движение: страницы и меню меняются мгновенно.
  const reduceMotion = useReducedMotion()

  // Перешли на другую страницу — выезжающее меню закрывается само.
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  // Пока меню открыто, страница под ним не прокручивается.
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  // Клавиша Escape закрывает меню.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Первая цель при обходе с клавиатуры: перепрыгнуть меню
          и попасть сразу в содержимое страницы. Видна только в фокусе. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        {t('a11y.skipToContent')}
      </a>

      <Header onMenuClick={() => setIsMenuOpen(true)} />

      <div className="flex flex-1">
        {/* Постоянное меню — только на широких экранах */}
        {/* Без размытия: за неподвижной колонкой ничего не проезжает,
            размывать нечего — оставался бы только расход на видеокарту.
            У шапки размытие осмысленно, там под неё уходит содержимое. */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
          <div className="sticky top-16">
            <Sidebar />
          </div>
        </aside>

        {/* Выезжающее меню — только на узких экранах */}
        <AnimatePresence>
          {isMenuOpen ? (
            <>
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 z-40 bg-overlay/20 backdrop-blur-sm lg:hidden"
              />

              <motion.aside
                key="drawer"
                initial={reduceMotion ? false : { x: '-100%' }}
                animate={{ x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { x: '-100%' }}
                transition={{
                  type: 'tween',
                  duration: reduceMotion ? 0 : 0.25,
                  ease: 'easeOut',
                }}
                className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card shadow-card-hover lg:hidden"
              >
                <div className="flex h-16 items-center justify-between border-b border-border px-4">
                  <p className="text-sm font-semibold tracking-tight text-foreground">
                    Меню
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Закрыть меню"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-body transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <Sidebar onNavigate={() => setIsMenuOpen(false)} />
              </motion.aside>
            </>
          ) : null}
        </AnimatePresence>

        <main id="main" className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.18 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Footer />
    </div>
  )
}