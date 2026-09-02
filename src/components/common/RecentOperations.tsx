import { useTranslation } from 'react-i18next'
import { EntityCard } from '@/components/common/EntityCard'
import { isBaseExpenseCategory } from '@/types/expense'
import type { Expense } from '@/types/expense'
import type { Income } from '@/types/income'

const MAX_ITEMS = 5

type RecentOperationsProps = {
  incomes: Income[]
  expenses: Expense[]
}

// Общий вид для дохода и расхода, чтобы сложить их в один список.
type Operation = {
  id: string
  kind: 'income' | 'expense'
  category: string
  source?: string
  note?: string
  date: string
  amount: number
}

export function RecentOperations({
  incomes,
  expenses,
}: RecentOperationsProps) {
  const { t } = useTranslation()

  const operations: Operation[] = [
    ...incomes.map((income) => ({
      id: income.id,
      kind: 'income' as const,
      category: t(`income.categories.${income.category}`),
      source: income.source ?? undefined,
      note: income.note ?? undefined,
      date: income.date,
      amount: income.amount,
    })),
    ...expenses.map((expense) => ({
      id: expense.id,
      kind: 'expense' as const,
      category: isBaseExpenseCategory(expense.category)
        ? t(`expense.categories.${expense.category}`)
        : expense.category,
      note: expense.note ?? undefined,
      date: expense.date,
      amount: expense.amount,
    })),
  ]
    // Свежие сверху.
    .sort((first, second) => second.date.localeCompare(first.date))
    .slice(0, MAX_ITEMS)

  if (operations.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm font-medium text-foreground">
          {t('widgets.recentEmpty')}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{t('widgets.recentHint')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {operations.map((operation) =>
        operation.kind === 'income' ? (
          <EntityCard
            key={operation.id}
            variant="income"
            category={operation.category}
            source={operation.source}
            note={operation.note}
            date={operation.date}
            amount={operation.amount}
          />
        ) : (
          <EntityCard
            key={operation.id}
            variant="expense"
            category={operation.category}
            note={operation.note}
            date={operation.date}
            amount={operation.amount}
          />
        ),
      )}
    </div>
  )
}