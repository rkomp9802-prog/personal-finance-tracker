import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDate, formatMoney } from '@/utils/format'
import type { Income } from '@/types/income'

type IncomeTableProps = {
  incomes: Income[]
  onEdit: (income: Income) => void
  onDelete: (income: Income) => void
  isDeleting: boolean
}

export function IncomeTable({
  incomes,
  onEdit,
  onDelete,
  isDeleting,
}: IncomeTableProps) {
  const { t } = useTranslation()
  // Строка, по которой нажали «Удалить» и ждём подтверждения.
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-4 py-3 font-medium text-muted-foreground">
              {t('income.columns.date')}
            </th>
            <th className="px-4 py-3 font-medium text-muted-foreground">
              {t('income.columns.category')}
            </th>
            <th className="px-4 py-3 font-medium text-muted-foreground">
              {t('income.columns.source')}
            </th>
            <th className="px-4 py-3 font-medium text-muted-foreground">
              {t('income.columns.note')}
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              {t('income.columns.amount')}
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              {t('income.columns.actions')}
            </th>
          </tr>
        </thead>

        <tbody>
          {incomes.map((income) => (
            <tr
              key={income.id}
              className="border-b border-muted transition-colors hover:bg-background"
            >
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                {formatDate(income.date)}
              </td>
              <td className="px-4 py-3 font-medium text-foreground">
                {t(`income.categories.${income.category}`)}
              </td>
              <td className="px-4 py-3 text-body">
                {income.source ?? '—'}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{income.note ?? '—'}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                + {formatMoney(income.amount)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                {confirmingId === income.id ? (
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-muted-foreground">
                      {t('income.confirmDelete')}
                    </span>
                    <Button
                      size="sm"
                      variant="danger"
                      isLoading={isDeleting}
                      onClick={() => {
                        onDelete(income)
                        setConfirmingId(null)
                      }}
                    >
                      {t('income.confirmYes')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmingId(null)}
                    >
                      {t('income.confirmNo')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(income)}
                      title={t('income.edit')}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmingId(income.id)}
                      title={t('income.delete')}
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