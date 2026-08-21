import { useTranslation } from 'react-i18next'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { Expenses } from '@/pages/Expenses'
import { Incomes } from '@/pages/Incomes'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/incomes" element={<Incomes />} />
            <Route path="/expenses" element={<Expenses />} />

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