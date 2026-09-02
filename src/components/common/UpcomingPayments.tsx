import { useTranslation } from 'react-i18next'
import { ArrowDownLeft, ArrowUpRight, Target } from 'lucide-react'
import { isBaseExpenseCategory } from '@/types/expense'
import { formatDate, formatMoney } from '@/utils/format'
import type { Expense } from '@/types/expense'
import type { Goal } from '@/types/goal'
import type { Income } from '@/types/income'

const MAX_ITEMS = 5

type UpcomingPaymentsProps = {
  incomes: Income[]
  expenses: Expense[]
  goals: Goal[]
}

type UpcomingItem = {
  id: string
  kind: 'income' | 'expense' | 'goal'
  label: string
  date: string
  amount: number
}

function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${now.getFullYear()}-${month}-${day}`
}

// Сколько дней осталось до даты. Считаем по календарным суткам.
function daysUntil(dateIso: string): number {
  const target = new Date(`${dateIso}T00:00:00`)
  const today = new Date(`${todayIso()}T00:00:00`)
  const millisecondsPerDay = 24 * 60 * 60 * 1000

  return Math.round((target.getTime() - today.getTime()) / millisecondsPerDay)
}

export function UpcomingPayments({
  incomes,
  expenses,
  goals,
}: UpcomingPaymentsProps) {
  const { t } = useTranslation()
  const today = todayIso()

  const items: UpcomingItem[] = [
    ...expenses
      .filter((expense) => expense.date >= today)
      .map((expense) => ({
        id: `expense-${expense.id}`,
        kind: 'expense' as const,
        label: isBaseExpenseCategory(expense.category)
          ? t(`expense.categories.${expense.category}`)
          : expense.category,
        date: expense.date,
        amount: expense.amount,
      })),
    ...incomes
      .filter((income) => income.date >= today)
      .map((income) => ({
        id: `income-${income.id}`,
        kind: 'income' as const,
        label: t(`income.categories.${income.category}`),
        date: income.date,
        amount: income.amount,
      })),
    ...goals
      .filter((goal) => goal.deadline !== null && goal.deadline >= today)
      .map((goal) => ({
        id: `goal-${goal.id}`,
        kind: 'goal' as const,
        label: `${t('widgets.goalDeadline')}: ${goal.title}`,
        date: goal.deadline as string,
        amount: Math.max(goal.target_amount - goal.current_amount, 0),
      })),
  ]
    // Ближайшие сверху.
    .sort((first, second) => first.date.localeCompare(second.date))
    .slice(0, MAX_ITEMS)

  function whenLabel(dateIso: string): string {
    const days = daysUntil(dateIso)

    if (days <= 0) {
      return t('widgets.today')
    }

    if (days === 1) {
      return t('widgets.tomorrow')
    }

    return t('widgets.inDays', { count: days })
  }

  if (items.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm font-medium text-foreground">
          {t('widgets.upcomingEmpty')}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('widgets.upcomingHint')}
        </p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col">
      {items.map((item) => {
        const Icon =
          item.kind === 'income'
            ? ArrowDownLeft
            : item.kind === 'goal'
              ? Target
              : ArrowUpRight

        return (
          <li
            key={item.id}
            className="flex items-center gap-3 border-b border-muted py-3 last:border-b-0"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Icon className="h-4 w-4" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {item.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDate(item.date)} · {whenLabel(item.date)}
              </p>
            </div>

            <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
              {formatMoney(item.amount)}
            </p>
          </li>
        )
      })}
    </ul>
  )
}