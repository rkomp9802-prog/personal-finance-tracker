import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Tags } from 'lucide-react'
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
import { CategoryManager } from '@/components/common/CategoryManager'
import { ExpenseForm } from '@/components/common/ExpenseForm'
import { ExpenseTable } from '@/components/common/ExpenseTable'
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from '@/services/expenseService'
import { formatMoney } from '@/utils/format'
import type { Expense, ExpenseInput } from '@/types/expense'

export function Expenses() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const expensesQuery = useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses,
  })

  function refreshList() {
    void queryClient.invalidateQueries({ queryKey: ['expenses'] })
  }

  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: refreshList,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ExpenseInput }) =>
      updateExpense(id, input),
    onSuccess: refreshList,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: refreshList,
  })

  async function handleCreate(input: ExpenseInput): Promise<boolean> {
    try {
      await createMutation.mutateAsync(input)
      showToast(t('expense.created'), 'success')
      setIsFormOpen(false)
      return true
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('expense.createError'),
        'error',
      )
      return false
    }
  }

  async function handleUpdate(input: ExpenseInput): Promise<boolean> {
    if (!editingExpense) {
      return false
    }

    try {
      await updateMutation.mutateAsync({ id: editingExpense.id, input })
      showToast(t('expenseList.updated'), 'success')
      setEditingExpense(null)
      return true
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('expenseList.updateError'),
        'error',
      )
      return false
    }
  }

  async function handleDelete(expense: Expense) {
    try {
      await deleteMutation.mutateAsync(expense.id)
      showToast(t('expenseList.deleted'), 'success')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('expenseList.deleteError'),
        'error',
      )
    }
  }

  const expenses = expensesQuery.data ?? []
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const isPanelOpen = isFormOpen || editingExpense !== null

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t('nav.expenses')}
          </h1>
          <p className="mt-2 text-pretty text-base text-body">{t('pages.expenses')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsCategoriesOpen((previous) => !previous)}
          >
            <Tags className="h-4 w-4" />
            {t('categoryManager.toggle')}
          </Button>

          <Button
            onClick={() => {
              setEditingExpense(null)
              setIsFormOpen((previous) => !previous)
            }}
          >
            <Plus className="h-4 w-4" />
            {t('expenseList.addButton')}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isCategoriesOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader>
                <CardTitle>{t('categoryManager.title')}</CardTitle>
                <CardDescription>
                  {t('categoryManager.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryManager />
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>

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
                  {editingExpense
                    ? t('expense.editTitle')
                    : t('expense.formTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ExpenseForm
                  key={editingExpense?.id ?? 'new'}
                  initialValue={editingExpense ?? undefined}
                  onSubmit={editingExpense ? handleUpdate : handleCreate}
                  onCancel={() => {
                    setIsFormOpen(false)
                    setEditingExpense(null)
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Card>
        <CardHeader>
          <CardTitle>{t('expenseList.listTitle')}</CardTitle>
          <CardDescription>
            {t('expenseList.countLabel', { count: expenses.length })} ·{' '}
            {t('expenseList.totalLabel')}: {formatMoney(total)}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          {expensesQuery.isPending ? (
            <div className="flex flex-col gap-3 px-6 pb-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : expensesQuery.isError ? (
            <div className="px-6 pb-6">
              <Alert variant="danger" title={t('expenseList.loadError')}>
                {expensesQuery.error instanceof Error
                  ? expensesQuery.error.message
                  : ''}
              </Alert>
            </div>
          ) : expenses.length === 0 ? (
            <div className="px-6 pb-8 pt-2 text-center">
              <p className="text-sm font-medium text-foreground">
                {t('expenseList.empty')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('expenseList.emptyHint')}
              </p>
            </div>
          ) : (
            <ExpenseTable
              expenses={expenses}
              onEdit={(expense) => {
                setIsFormOpen(false)
                setEditingExpense(expense)
              }}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}