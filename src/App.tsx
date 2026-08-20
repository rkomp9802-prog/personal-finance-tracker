import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'

// Временная заглушка вместо страницы входа. Настоящая будет на шаге 3.3.
function TemporaryLoginScreen() {
  const location = useLocation()
  const from = location.state as string | null

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Вход</CardTitle>
          <CardDescription>
            Временный экран. Настоящая форма появится на шаге 3.3.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Alert title="Охранник сработал">
            Вы не вошли в систему, поэтому доступ к закрытой странице закрыт.
          </Alert>
          {from ? (
            <p className="text-sm text-slate-500">
              Вы пытались открыть: <span className="text-slate-900">{from}</span>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

// Временная заглушка вместо главной страницы. Настоящая будет на Этапе 9.
function TemporaryDashboard() {
  const { user, signOut } = useAuth()
  const { showToast } = useToast()

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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Закрытая страница</CardTitle>
            <CardDescription>
              Сюда попадают только вошедшие пользователи.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Alert variant="success" title="Доступ разрешён">
              {user?.email}
            </Alert>
            <Button variant="secondary" onClick={handleSignOut}>
              Выйти из аккаунта
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<TemporaryLoginScreen />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<TemporaryDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App