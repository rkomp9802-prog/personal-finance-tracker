import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/layout/ThemeSwitcher'
import { useAuth } from '@/context/AuthContext'
import { getProfile } from '@/services/profileService'

type HeaderProps = {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth()
  const { showToast } = useToast()
  const { t } = useTranslation()

  // Тот же ключ, что и на странице профиля: данные загрузятся один раз.
  const profileQuery = useQuery({ queryKey: ['profile'], queryFn: getProfile })

  const metadataName = user?.user_metadata?.name as string | undefined
  const displayName = metadataName ?? user?.email ?? ''
  const initial = displayName.charAt(0).toUpperCase()
  const avatarUrl = profileQuery.data?.avatar_url ?? null

  async function handleSignOut() {
    try {
      await signOut()
      showToast(t('auth.signOutSuccess'), 'success')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('auth.signOutError'),
        'error',
      )
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/70 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={t('header.openMenu')}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-body transition-colors hover:bg-muted hover:text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <p className="truncate text-sm font-semibold tracking-tight text-foreground">
          {t('app.name')}
        </p>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <ThemeSwitcher />
          <LanguageSwitcher />

          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-sm font-medium text-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>

          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={t('profile.avatar')}
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {initial}
            </div>
          )}

          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t('header.signOut')}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}