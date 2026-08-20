import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
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
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'

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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<TemporaryDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App