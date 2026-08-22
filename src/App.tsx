import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { useToast } from '@/components/ui/Toast'
import { EntityCard } from '@/components/common/EntityCard'
import { GoalDeposit } from '@/components/common/GoalDeposit'
import { GoalForm } from '@/components/common/GoalForm'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { Budgets } from '@/pages/Budgets'
import { Expenses } from '@/pages/Expenses'
import { Incomes } from '@/pages/Incomes'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { createGoal, depositToGoal, getGoals } from '@/services/goalService'
import type { GoalInput } from '@/types/goal'

const placeholderRoutes = [
  { path: '/', titleKey: 'nav.dashboard', descriptionKey: 'pages.dashboard', stage: '9' },
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

// Временный экран для проверки. Настоящая страница — на шаге 8.3.
function GoalPreview() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const goalsQuery = useQuery({ queryKey: ['goals'], queryFn: getGoals })

  function refreshGoals() {
    void queryClient.invalidateQueries({ queryKey: ['goals'] })
  }

  const createMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: refreshGoals,
  })

  const depositMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      depositToGoal(id, amount),
    onSuccess: refreshGoals,
  })

  async function handleCreate(input: GoalInput): Promise<boolean> {
    try {
      await createMutation.mutateAsync(input)
      showToast(t('goal.created'), 'success')
      return true
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('goal.createError'),
        'error',
      )
      return false
    }
  }

  async function handleDeposit(amount: number): Promise<boolean> {
    if (!selectedId) {
      return false
    }

    try {
      await depositMutation.mutateAsync({ id: selectedId, amount })
      showToast(t('goal.depositDone'), 'success')
      return true
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('goal.depositError'),
        'error',
      )
      return false
    }
  }

  const goals = goalsQuery.data ?? []
  const selectedGoal = goals.find((goal) => goal.id === selectedId) ?? null

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('goal.formTitle')}</CardTitle>
          <CardDescription>{t('pages.goals')}</CardDescription>
        </CardHeader>
        <CardContent>
          <GoalForm onSubmit={handleCreate} />
        </CardContent>
      </Card>

      {selectedGoal ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('goal.depositTitle')}</CardTitle>
            <CardDescription>{selectedGoal.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <GoalDeposit
              onDeposit={handleDeposit}
              isPending={depositMutation.isPending}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t('goal.listTitle')}</CardTitle>
          <CardDescription>
            {t('goal.countLabel', { count: goals.length })}
            {goals.length > 0 ? ` · ${t('goal.selectHint')}` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {goalsQuery.isPending ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
            </div>
          ) : goalsQuery.isError ? (
            <Alert variant="danger" title={t('goal.loadError')} />
          ) : goals.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm font-medium text-slate-900">
                {t('goal.empty')}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {t('goal.emptyHint')}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {goals.map((goal) => (
                <EntityCard
                  key={goal.id}
                  variant="goal"
                  title={goal.title}
                  targetAmount={goal.target_amount}
                  currentAmount={goal.current_amount}
                  deadline={goal.deadline ?? undefined}
                  onClick={() => setSelectedId(goal.id)}
                />
              ))}
            </div>
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
            <Route path="/incomes" element={<Incomes />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/goals" element={<GoalPreview />} />

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