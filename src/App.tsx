import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'

// Закрытые страницы едут отдельными файлами и скачиваются
// в момент первого открытия, а не все сразу при входе.
const Dashboard = lazy(async () => ({
  default: (await import('@/pages/Dashboard')).Dashboard,
}))

const Incomes = lazy(async () => ({
  default: (await import('@/pages/Incomes')).Incomes,
}))

const Expenses = lazy(async () => ({
  default: (await import('@/pages/Expenses')).Expenses,
}))

const Budgets = lazy(async () => ({
  default: (await import('@/pages/Budgets')).Budgets,
}))

const Goals = lazy(async () => ({
  default: (await import('@/pages/Goals')).Goals,
}))

const Statistics = lazy(async () => ({
  default: (await import('@/pages/Statistics')).Statistics,
}))

const Calendar = lazy(async () => ({
  default: (await import('@/pages/Calendar')).Calendar,
}))

const Profile = lazy(async () => ({
  default: (await import('@/pages/Profile')).Profile,
}))

// Что показать, пока файл страницы скачивается.
function PageLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-36 w-full rounded-2xl" />
      <Skeleton className="h-56 w-full rounded-2xl" />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/incomes" element={<Incomes />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App