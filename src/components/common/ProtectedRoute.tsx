import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/context/AuthContext'

// Пока идёт проверка cookies — показываем заглушку вместо пустого экрана.
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  )
}

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  // Проверка ещё идёт — ничего не решаем.
  if (isLoading) {
    return <LoadingScreen />
  }

  // Пропуска нет — отправляем на вход и запоминаем, куда человек хотел попасть.
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // Пропуск есть — показываем запрошенную страницу.
  return <Outlet />
}