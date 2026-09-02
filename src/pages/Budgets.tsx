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
import { BudgetForm } from '@/components/common/BudgetForm'
import { BudgetList } from '@/components/common/BudgetList'
import {
  buildBudgetsWithProgress,
  createBudget,
  deleteBudget,
  getBudgets,
  updateBudget,
} from '@/services/budgetService'
import { getExpenses } from '@/services/expenseService'
import { formatMoney } from '@/utils/format'
import type { Budget, BudgetInput } from '@/types/budget'

export function Budgets() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const budgetsQuery = useQuery({ queryKey: ['budgets'], queryFn: getBudgets })
  const expensesQuery = useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses,
  })

  function refreshBudgets() {
    void queryClient.invalidateQueries({ queryKey: ['budgets'] })
  }

  const createMutation = useMutation({
    mutationFn: createBudget,
    onSuccess: refreshBudgets,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: BudgetInput }) =>
      updateBudget(id, input),
    onSuccess: refreshBudgets,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBudget,
    onSuccess: refreshBudgets,
  })

  // Сервис может вернуть ключ перевода вместо технического текста.
  function toMessage(error: unknown, fallbackKey: string): string {
    if (!(error instanceof Error)) {
      return t(fallbackKey)
    }

    return error.message.startsWith('budget.') ? t(error.message) : error.message
  }

  function closePanel() {
    setIsFormOpen(false)
    setEditingBudget(null)
    setIsConfirmingDelete(false)
  }

  async function handleCreate(input: BudgetInput): Promise<boolean> {
    try {
      await createMutation.mutateAsync(input)
      showToast(t('budget.created'), 'success')
      closePanel()
      return true
    } catch (error) {
      showToast(toMessage(error, 'budget.createError'), 'error')
      return false
    }
  }

  async function handleUpdate(input: BudgetInput): Promise<boolean> {
    if (!editingBudget) {
      return false
    }

    try {
      await updateMutation.mutateAsync({ id: editingBudget.id, input })
      showToast(t('budgetList.updated'), 'success')
      closePanel()
      return true
    } catch (error) {
      showToast(toMessage(error, 'budgetList.updateError'), 'error')
      return false
    }
  }

  async function handleDelete() {
    if (!editingBudget) {
      return
    }

    try {
      await deleteMutation.mutateAsync(editingBudget.id)
      showToast(t('budgetList.deleted'), 'success')
      closePanel()
    } catch (error) {
      showToast(toMessage(error, 'budgetList.deleteError'), 'error')
    }
  }

  const rawBudgets = budgetsQuery.data ?? []
  const budgets = buildBudgetsWithProgress(rawBudgets, expensesQuery.data ?? [])

  const totalLimit = budgets.reduce((sum, item) => sum + item.limit_amount, 0)
  const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0)
  const overCount = budgets.filter((item) => item.isOverLimit).length

  const isLoading = budgetsQuery.isPending || expensesQuery.isPending
  const isError = budgetsQuery.isError || expensesQuery.isError
  const isPanelOpen = isFormOpen || editingBudget !== null

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t('nav.budgets')}
          </h1>
          <p className="mt-1 text-sm text-body">{t('pages.budgets')}</p>
        </div>

        <Button
          onClick={() => {
            setEditingBudget(null)
            setIsConfirmingDelete(false)
            setIsFormOpen((previous) => !previous)
          }}
        >
          <Plus className="h-4 w-4" />
          {t('budget.addButton')}
        </Button>
      </div>

      {budgets.length > 0 ? (
        <Card>
          <CardContent className="flex flex-wrap items-baseline gap-x-8 gap-y-2 pt-6 text-sm">
            <p className="text-muted-foreground">
              {t('budgetList.totalLimit')}:{' '}
              <span className="font-semibold tabular-nums text-foreground">
                {formatMoney(totalLimit)}
              </span>
            </p>
            <p className="text-muted-foreground">
              {t('budgetList.totalSpent')}:{' '}
              <span className="font-semibold tabular-nums text-foreground">
                {formatMoney(totalSpent)}
              </span>
            </p>
            <p
              className={
                overCount > 0 ? 'text-amber-700' : 'text-muted-foreground'
              }
            >
              {overCount > 0
                ? t('budgetList.overCount', { count: overCount })
                : t('budgetList.allWithinLimits')}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <AnimatePresence>
        {isPanelOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingBudget ? t('budget.editTitle') : t('budget.formTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <BudgetForm
                  key={editingBudget?.id ?? 'new'}
                  initialValue={editingBudget ?? undefined}
                  usedCategories={rawBudgets.map((budget) => budget.category)}
                  onSubmit={editingBudget ? handleUpdate : handleCreate}
                  onCancel={closePanel}
                />

                {editingBudget ? (
                  <div className="border-t border-muted pt-4">
                    {isConfirmingDelete ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="mr-auto text-sm text-body">
                          {t('budgetList.confirmDelete')}{' '}
                          <span className="text-subtle-foreground">
                            {t('budgetList.deleteWarning')}
                          </span>
                        </span>
                        <Button
                          variant="danger"
                          size="sm"
                          isLoading={deleteMutation.isPending}
                          onClick={() => void handleDelete()}
                        >
                          {t('budgetList.confirmYes')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsConfirmingDelete(false)}
                        >
                          {t('budgetList.confirmNo')}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsConfirmingDelete(true)}
                      >
                        <Trash2 className="h-4 w-4" />
                        {t('budgetList.delete')}
                      </Button>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Card>
        <CardHeader>
          <CardTitle>{t('budget.listTitle')}</CardTitle>
          <CardDescription>
            {t('budget.countLabel', { count: budgets.length })}
            {budgets.length > 0 ? ` · ${t('budgetList.editHint')}` : ''}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
            </div>
          ) : isError ? (
            <Alert variant="danger" title={t('budget.loadError')} />
          ) : budgets.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm font-medium text-foreground">
                {t('budget.empty')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('budget.emptyHint')}
              </p>
            </div>
          ) : (
            <BudgetList
              budgets={budgets}
              onSelect={(budget) => {
                setIsFormOpen(false)
                setIsConfirmingDelete(false)
                setEditingBudget(budget)
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}