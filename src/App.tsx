import { useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'

function App() {
  const { user, session, isLoading, signOut } = useAuth()
  const { showToast } = useToast()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    setIsSigningOut(true)

    try {
      await signOut()
      showToast('Вы вышли из аккаунта', 'success')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Не удалось выйти',
        'error',
      )
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Personal Finance Tracker
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            Состояние авторизации
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Кто сейчас в системе</CardTitle>
            <CardDescription>
              Эти данные приходят из AuthContext и обновляются сами.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {isLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : user ? (
              <>
                <Alert variant="success" title="Вход выполнен">
                  {user.email}
                </Alert>
                <dl className="grid grid-cols-3 gap-2 text-sm">
                  <dt className="text-slate-500">Идентификатор</dt>
                  <dd className="col-span-2 break-all text-slate-900">
                    {user.id}
                  </dd>
                  <dt className="text-slate-500">Пропуск истекает</dt>
                  <dd className="col-span-2 text-slate-900">
                    {session?.expires_at
                      ? new Date(session.expires_at * 1000).toLocaleString(
                          'ru-RU',
                        )
                      : 'неизвестно'}
                  </dd>
                </dl>
                <Button
                  variant="secondary"
                  isLoading={isSigningOut}
                  onClick={handleSignOut}
                >
                  Выйти из аккаунта
                </Button>
              </>
            ) : (
              <Alert title="Вы не вошли">
                Активной сессии нет. Страницы входа и регистрации появятся на
                шаге 3.3 — тогда это окно покажет ваши данные.
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App