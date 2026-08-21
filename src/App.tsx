import { useTranslation } from 'react-i18next'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { IncomeForm } from '@/components/common/IncomeForm'
import { MainLayout } from '@/components/layout/MainLayout'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { createIncome } from '@/services/incomeService'
import type { IncomeInput } from '@/types/income'

// Разделы, у которых настоящей страницы ещё нет.
const placeholderRoutes = [
  { path: '/', titleKey: 'nav.dashboard', descriptionKey: 'pages.dashboard', stage: '9' },
  { path: '/expenses', titleKey: 'nav.expenses', descriptionKey: 'pages.expenses', stage: '6' },
  { path: '/budgets', titleKey: 'nav.budgets', descriptionKey: 'pages.budgets', stage: '7' },
  { path: '/goals', titleKey: 'nav.goals', descriptionKey: 'pages.goals', stage: '8' },
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

// Временный экран для проверки формы. Настоящая страница — на шаге 5.3.
function IncomeFormPreview() {
  const { t } = useTranslation()
  const { showToast } = useToast()

  async function handleSubmit(input: IncomeInput): Promise<boolean> {
    try {
      await createIncome(input)
      showToast(t('income.created'), 'success')
      return true
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('income.createError'),
        'error',
      )
      return false
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{t('income.formTitle')}</CardTitle>
          <CardDescription>{t('pages.incomes')}</CardDescription>
        </CardHeader>
        <CardContent>
          <IncomeForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
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
            <Route path="/incomes" element={<IncomeFormPreview />} />

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