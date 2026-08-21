import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
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
import { IncomeForm } from '@/components/common/IncomeForm'
import { IncomeTable } from '@/components/common/IncomeTable'
import {
  createIncome,
  deleteIncome,
  getIncomes,
  updateIncome,
} from '@/services/incomeService'
import { formatMoney } from '@/utils/format'
import type { Income, IncomeInput } from '@/types/income'

export function Incomes() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)

  // Загрузка списка. TanStack Query сам хранит результат и следит за свежестью.
  const incomesQuery = useQuery({
    queryKey: ['incomes'],
    queryFn: getIncomes,
  })

  function refreshList() {
    void queryClient.invalidateQueries({ queryKey: ['incomes'] })
  }

  const createMutation = useMutation({
    mutationFn: createIncome,
    onSuccess: refreshList,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: IncomeInput }) =>
      updateIncome(id, input),
    onSuccess: refreshList,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteIncome,
    onSuccess: refreshList,
  })

  async function handleCreate(input: IncomeInput): Promise<boolean> {
    try {
      await createMutation.mutateAsync(input)
      showToast(t('income.created'), 'success')
      setIsFormOpen(false)
      return true
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('income.createError'),
        'error',
      )
      return false
    }
  }

  async function handleUpdate(input: IncomeInput): Promise<boolean> {
    if (!editingIncome) {
      return false
    }

    try {
      await updateMutation.mutateAsync({ id: editingIncome.id, input })
      showToast(t('income.updated'), 'success')
      setEditingIncome(null)
      return true
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('income.updateError'),
        'error',
      )
      return false
    }
  }

  async function handleDelete(income: Income) {
    try {
      await deleteMutation.mutateAsync(income.id)
      showToast(t('income.deleted'), 'success')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('income.deleteError'),
        'error',
      )
    }
  }

  const incomes = incomesQuery.data ?? []
  const total = incomes.reduce((sum, income) => sum + income.amount, 0)
  const isPanelOpen = isFormOpen || editingIncome !== null

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t('nav.incomes')}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{t('pages.incomes')}</p>
        </div>

        <Button
          onClick={() => {
            setEditingIncome(null)
            setIsFormOpen((previous) => !previous)
          }}
        >
          <Plus className="h-4 w-4" />
          {t('income.addButton')}
        </Button>
      </div>

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
                  {editingIncome ? t('income.editTitle') : t('income.formTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <IncomeForm
                  key={editingIncome?.id ?? 'new'}
                  initialValue={editingIncome ?? undefined}
                  onSubmit={editingIncome ? handleUpdate : handleCreate}
                  onCancel={() => {
                    setIsFormOpen(false)
                    setEditingIncome(null)
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Card>
        <CardHeader>
          <CardTitle>{t('income.listTitle')}</CardTitle>
          <CardDescription>
            {t('income.countLabel', { count: incomes.length })} ·{' '}
            {t('income.totalLabel')}: {formatMoney(total)}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          {incomesQuery.isPending ? (
            <div className="flex flex-col gap-3 px-6 pb-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : incomesQuery.isError ? (
            <div className="px-6 pb-6">
              <Alert variant="danger" title={t('income.loadError')}>
                {incomesQuery.error instanceof Error
                  ? incomesQuery.error.message
                  : ''}
              </Alert>
            </div>
          ) : incomes.length === 0 ? (
            <div className="px-6 pb-8 pt-2 text-center">
              <p className="text-sm font-medium text-slate-900">
                {t('income.empty')}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {t('income.emptyHint')}
              </p>
            </div>
          ) : (
            <IncomeTable
              incomes={incomes}
              onEdit={(income) => {
                setIsFormOpen(false)
                setEditingIncome(income)
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