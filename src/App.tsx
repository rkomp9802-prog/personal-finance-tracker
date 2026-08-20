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
  title,
  description,
  stage,
}: {
  title: string
  description: string
  stage: string
}) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Раздел в разработке. Настоящая страница появится на {stage}.
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
                  title="Главная"
                  description="Сводка по вашим финансам"
                  stage="Этапе 9"
                />
              }
            />
            <Route
              path="/incomes"
              element={
                <PlaceholderPage
                  title="Доходы"
                  description="Учёт поступлений"
                  stage="Этапе 5"
                />
              }
            />
            <Route
              path="/expenses"
              element={
                <PlaceholderPage
                  title="Расходы"
                  description="Учёт трат по категориям"
                  stage="Этапе 6"
                />
              }
            />
            <Route
              path="/budgets"
              element={
                <PlaceholderPage
                  title="Бюджеты"
                  description="Лимиты по категориям"
                  stage="Этапе 7"
                />
              }
            />
            <Route
              path="/goals"
              element={
                <PlaceholderPage
                  title="Цели"
                  description="Накопления и сроки"
                  stage="Этапе 8"
                />
              }
            />
            <Route
              path="/calendar"
              element={
                <PlaceholderPage
                  title="Календарь"
                  description="Платежи и поступления по дням"
                  stage="Этапе 11"
                />
              }
            />
            <Route
              path="/statistics"
              element={
                <PlaceholderPage
                  title="Статистика"
                  description="Графики и разбор трат"
                  stage="Этапе 10"
                />
              }
            />
            <Route
              path="/profile"
              element={
                <PlaceholderPage
                  title="Профиль"
                  description="Личные данные и настройки"
                  stage="Этапе 12"
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