import { useTranslation } from 'react-i18next'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { SummaryCards } from '@/components/common/SummaryCards'
import { MainLayout } from '@/components/layout/MainLayout'
import { useFinanceSummary } from '@/hooks/useFinanceSummary'
import { Budgets } from '@/pages/Budgets'
import { Expenses } from '@/pages/Expenses'
import { Goals } from '@/pages/Goals'
import { Incomes } from '@/pages/Incomes'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'

const placeholderRoutes = [
  { path: '/calendar', titleKey: 'nav.calendar', descriptionKey: 'pages.calendar', stage: '11' },
  { path: '/statistics', titleKey: 'nav.statistics', descriptionKey: 'pages.statistics', stage: '10' },
  { path: '/profile', titleKey: 'nav.profile', descriptionKey: 'pages.profile', stage: '12' },
]

function PlaceholderPage({
  titleKey,
  descriptionKey,
  stage,
}: {
  titleKey: string
  descriptionKey: string
  stage: string
}) {
  const { t } = useTranslation()

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>{t(titleKey)}</CardTitle>
          <CardDescription>{t(descriptionKey)}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            {t('pages.placeholder', { stage })}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Временный экран для проверки. Настоящая главная — на шаге 9.3.
function DashboardPreview() {
  const { t } = useTranslation()
  const { summary, isPending, isError } = useFinanceSummary()

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {t('nav.dashboard')}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{t('pages.dashboard')}</p>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        </div>
      ) : isError ? (
        <Alert variant="danger" title={t('dashboard.loadError')} />
      ) : (
        <SummaryCards summary={summary} />
      )}
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
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPreview />} />
            <Route path="/incomes" element={<Incomes />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/goals" element={<Goals />} />

            {placeholderRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <PlaceholderPage
                    titleKey={route.titleKey}
                    descriptionKey={route.descriptionKey}
                    stage={route.stage}
                  />
                }
              />
            ))}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App