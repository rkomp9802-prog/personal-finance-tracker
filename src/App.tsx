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
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'

// Временная заглушка. Каждый раздел получит настоящую страницу на своём этапе.
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
            <Route
              path="/"
              element={
                <PlaceholderPage
                  titleKey="nav.dashboard"
                  descriptionKey="pages.dashboard"
                  stage="9"
                />
              }
            />
            <Route
              path="/incomes"
              element={
                <PlaceholderPage
                  titleKey="nav.incomes"
                  descriptionKey="pages.incomes"
                  stage="5"
                />
              }
            />
            <Route
              path="/expenses"
              element={
                <PlaceholderPage
                  titleKey="nav.expenses"
                  descriptionKey="pages.expenses"
                  stage="6"
                />
              }
            />
            <Route
              path="/budgets"
              element={
                <PlaceholderPage
                  titleKey="nav.budgets"
                  descriptionKey="pages.budgets"
                  stage="7"
                />
              }
            />
            <Route
              path="/goals"
              element={
                <PlaceholderPage
                  titleKey="nav.goals"
                  descriptionKey="pages.goals"
                  stage="8"
                />
              }
            />
            <Route
              path="/calendar"
              element={
                <PlaceholderPage
                  titleKey="nav.calendar"
                  descriptionKey="pages.calendar"
                  stage="11"
                />
              }
            />
            <Route
              path="/statistics"
              element={
                <PlaceholderPage
                  titleKey="nav.statistics"
                  descriptionKey="pages.statistics"
                  stage="10"
                />
              }
            />
            <Route
              path="/profile"
              element={
                <PlaceholderPage
                  titleKey="nav.profile"
                  descriptionKey="pages.profile"
                  stage="12"
                />
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App