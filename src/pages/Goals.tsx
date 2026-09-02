import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
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
import { useToast } from '@/components/ui/Toast'
import { EntityCard } from '@/components/common/EntityCard'
import { GoalDeposit } from '@/components/common/GoalDeposit'
import { GoalForm } from '@/components/common/GoalForm'
import {
  createGoal,
  deleteGoal,
  depositToGoal,
  getGoals,
  updateGoal,
} from '@/services/goalService'
import { formatMoney } from '@/utils/format'
import type { GoalInput } from '@/types/goal'

export function Goals() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const goalsQuery = useQuery({ queryKey: ['goals'], queryFn: getGoals })

  function refreshGoals() {
    void queryClient.invalidateQueries({ queryKey: ['goals'] })
  }

  const createMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: refreshGoals,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: GoalInput }) =>
      updateGoal(id, input),
    onSuccess: refreshGoals,
  })

  const depositMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      depositToGoal(id, amount),
    onSuccess: refreshGoals,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: refreshGoals,
  })

  function closePanels() {
    setIsCreateOpen(false)
    setSelectedId(null)
    setIsConfirmingDelete(false)
  }

  async function handleCreate(input: GoalInput): Promise<boolean> {
    try {
      await createMutation.mutateAsync(input)
      showToast(t('goal.created'), 'success')
      setIsCreateOpen(false)
      return true
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('goal.createError'),
        'error',
      )
      return false
    }
  }

  async function handleUpdate(input: GoalInput): Promise<boolean> {
    if (!selectedId) {
      return false
    }

    try {
      await updateMutation.mutateAsync({ id: selectedId, input })
      showToast(t('goalList.updated'), 'success')
      return true
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('goalList.updateError'),
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

  async function handleDelete() {
    if (!selectedId) {
      return
    }

    try {
      await deleteMutation.mutateAsync(selectedId)
      showToast(t('goalList.deleted'), 'success')
      closePanels()
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('goalList.deleteError'),
        'error',
      )
    }
  }

  const goals = goalsQuery.data ?? []
  const selectedGoal = goals.find((goal) => goal.id === selectedId) ?? null

  const totalTarget = goals.reduce((sum, goal) => sum + goal.target_amount, 0)
  const totalSaved = goals.reduce((sum, goal) => sum + goal.current_amount, 0)
  const reachedCount = goals.filter(
    (goal) => goal.current_amount >= goal.target_amount,
  ).length

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t('nav.goals')}
          </h1>
          <p className="mt-1 text-sm text-body">{t('pages.goals')}</p>
        </div>

        <Button
          onClick={() => {
            setSelectedId(null)
            setIsConfirmingDelete(false)
            setIsCreateOpen((previous) => !previous)
          }}
        >
          <Plus className="h-4 w-4" />
          {t('goal.addButton')}
        </Button>
      </div>

      {goals.length > 0 ? (
        <Card>
          <CardContent className="flex flex-wrap items-baseline gap-x-8 gap-y-2 pt-6 text-sm">
            <p className="text-muted-foreground">
              {t('goalList.totalTarget')}:{' '}
              <span className="font-semibold tabular-nums text-foreground">
                {formatMoney(totalTarget)}
              </span>
            </p>
            <p className="text-muted-foreground">
              {t('goalList.totalSaved')}:{' '}
              <span className="font-semibold tabular-nums text-foreground">
                {formatMoney(totalSaved)}
              </span>
            </p>
            <p className={reachedCount > 0 ? 'text-emerald-700' : 'text-muted-foreground'}>
              {reachedCount > 0
                ? t('goalList.reachedCount', { count: reachedCount })
                : t('goalList.noneReached')}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <AnimatePresence>
        {isCreateOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader>
                <CardTitle>{t('goal.formTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <GoalForm
                  onSubmit={handleCreate}
                  onCancel={() => setIsCreateOpen(false)}
                />
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {selectedGoal ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader>
                <CardTitle>{selectedGoal.title}</CardTitle>
                <CardDescription>{t('goal.depositTitle')}</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col gap-6">
                <GoalDeposit
                  onDeposit={handleDeposit}
                  isPending={depositMutation.isPending}
                />

                <div className="border-t border-muted pt-5">
                  <p className="mb-4 text-sm font-medium text-label">
                    {t('goalList.editSection')}
                  </p>
                  <GoalForm
                    key={selectedGoal.id}
                    initialValue={selectedGoal}
                    onSubmit={handleUpdate}
                    onCancel={closePanels}
                  />
                </div>

                <div className="border-t border-muted pt-4">
                  {isConfirmingDelete ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="mr-auto text-sm text-body">
                        {t('goalList.confirmDelete')}{' '}
                        <span className="text-subtle-foreground">
                          {t('goalList.deleteWarning')}
                        </span>
                      </span>
                      <Button
                        variant="danger"
                        size="sm"
                        isLoading={deleteMutation.isPending}
                        onClick={() => void handleDelete()}
                      >
                        {t('goalList.confirmYes')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsConfirmingDelete(false)}
                      >
                        {t('goalList.confirmNo')}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsConfirmingDelete(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('goalList.delete')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Card>
        <CardHeader>
          <CardTitle>{t('goal.listTitle')}</CardTitle>
          <CardDescription>
            {t('goal.countLabel', { count: goals.length })}
            {goals.length > 0 ? ` · ${t('goalList.editHint')}` : ''}
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
              <p className="text-sm font-medium text-foreground">
                {t('goal.empty')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
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
                  onClick={() => {
                    setIsCreateOpen(false)
                    setIsConfirmingDelete(false)
                    setSelectedId(goal.id)
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}