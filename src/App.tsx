import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { MonthCalendar } from '@/components/common/MonthCalendar'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { useFinanceSummary } from '@/hooks/useFinanceSummary'
import { Budgets } from '@/pages/Budgets'
import { Dashboard } from '@/pages/Dashboard'
import { Expenses } from '@/pages/Expenses'
import { Goals } from '@/pages/Goals'
import { Incomes } from '@/pages/Incomes'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Statistics } from '@/pages/Statistics'

const placeholderRoutes = [
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

// Временный экран для проверки. Настоящая страница — на шаге 11.2.
function CalendarPreview() {
  const { t, i18n } = useTranslation()
  const { incomes, expenses, isPending, isError } = useFinanceSummary()
  const now = new Date()

  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  function shiftMonth(step: number) {
    const shifted = new Date(year, month + step, 1)

    setYear(shifted.getFullYear())
    setMonth(shifted.getMonth())
  }

  const monthTitle = new Intl.DateTimeFormat(i18n.resolvedLanguage ?? 'ru', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, 1))

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {t('nav.calendar')}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{t('pages.calendar')}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="capitalize">{monthTitle}</CardTitle>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => shiftMonth(-1)}
                title={t('calendar.previousMonth')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => shiftMonth(1)}
                title={t('calendar.nextMonth')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isPending ? (
            <Skeleton className="h-96 w-full rounded-2xl" />
          ) : isError ? (
            <Alert variant="danger" title={t('calendar.loadError')} />
          ) : (
            <MonthCalendar
              year={year}
              month={month}
              incomes={incomes}
              expenses={expenses}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          )}
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/incomes" element={<Incomes />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/calendar" element={<CalendarPreview />} />

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