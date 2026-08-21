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
import { ExpenseForm } from '@/components/common/ExpenseForm'
import { MainLayout } from '@/components/layout/MainLayout'
import { Incomes } from '@/pages/Incomes'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { createExpense } from '@/services/expenseService'
import type { ExpenseInput } from '@/types/expense'

const placeholderRoutes = [
  { path: '/', titleKey: 'nav.dashboard', descriptionKey: 'pages.dashboard', stage: '9' },
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

// Временный экран для проверки формы. Настоящая страница — на шаге 6.3.
function ExpenseFormPreview() {
  const { t } = useTranslation()
  const { showToast } = useToast()

  async function handleSubmit(input: ExpenseInput): Promise<boolean> {
    try {
      await createExpense(input)
      showToast(t('expense.created'), 'success')
      return true
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('expense.createError'),
        'error',
      )
      return false
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{t('expense.formTitle')}</CardTitle>
          <CardDescription>{t('pages.expenses')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm onSubmit={handleSubmit} />
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
            <Route path="/incomes" element={<Incomes />} />
            <Route path="/expenses" element={<ExpenseFormPreview />} />

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