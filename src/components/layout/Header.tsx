import { LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'

type HeaderProps = {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth()
  const { showToast } = useToast()

  const metadataName = user?.user_metadata?.name as string | undefined
  const displayName = metadataName ?? user?.email ?? ''
  const initial = displayName.charAt(0).toUpperCase()

  async function handleSignOut() {
    try {
      await signOut()
      showToast('Вы вышли из аккаунта', 'success')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Не удалось выйти',
        'error',
      )
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/70 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Открыть меню"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <p className="truncate text-sm font-semibold tracking-tight text-slate-900">
          Personal Finance Tracker
        </p>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-sm font-medium text-slate-900">
              {displayName}
            </p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            {initial}
          </div>

          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Выйти</span>
          </Button>
        </div>
      </div>
    </header>
  )
}