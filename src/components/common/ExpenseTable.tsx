import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { isBaseExpenseCategory } from '@/types/expense'
import { formatDate, formatMoney } from '@/utils/format'
import type { Expense } from '@/types/expense'

type ExpenseTableProps = {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
  isDeleting: boolean
}

export function ExpenseTable({
  expenses,
  onEdit,
  onDelete,
  isDeleting,
}: ExpenseTableProps) {
  const { t } = useTranslation()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  // Базовую категорию переводим, свою показываем как есть.
  function categoryLabel(category: string): string {
    return isBaseExpenseCategory(category)
      ? t(`expense.categories.${category}`)
      : category
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th className="px-4 py-3 font-medium text-slate-500">
              {t('expenseList.columns.date')}
            </th>
            <th className="px-4 py-3 font-medium text-slate-500">
              {t('expenseList.columns.category')}
            </th>
            <th className="px-4 py-3 font-medium text-slate-500">
              {t('expenseList.columns.note')}
            </th>
            <th className="px-4 py-3 text-right font-medium text-slate-500">
              {t('expenseList.columns.amount')}
            </th>
            <th className="px-4 py-3 text-right font-medium text-slate-500">
              {t('expenseList.columns.actions')}
            </th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              className="border-b border-slate-100 transition-colors hover:bg-slate-50"
            >
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                {formatDate(expense.date)}
              </td>
              <td className="px-4 py-3 font-medium text-slate-900">
                {categoryLabel(expense.category)}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {expense.note ?? '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-slate-900">
                − {formatMoney(expense.amount)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                {confirmingId === expense.id ? (
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-slate-500">
                      {t('expenseList.confirmDelete')}
                    </span>
                    <Button
                      size="sm"
                      variant="danger"
                      isLoading={isDeleting}
                      onClick={() => {
                        onDelete(expense)
                        setConfirmingId(null)
                      }}
                    >
                      {t('expenseList.confirmYes')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmingId(null)}
                    >
                      {t('expenseList.confirmNo')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(expense)}
                      title={t('expenseList.edit')}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmingId(expense.id)}
                      title={t('expenseList.delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}