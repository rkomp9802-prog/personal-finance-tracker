import { useQuery } from '@tanstack/react-query'
import { getExpenses } from '@/services/expenseService'
import { getGoals } from '@/services/goalService'
import { getIncomes } from '@/services/incomeService'
import type { Expense } from '@/types/expense'
import type { Goal } from '@/types/goal'
import type { Income } from '@/types/income'

export type FinanceSummary = {
  balance: number
  incomeThisMonth: number
  expenseThisMonth: number
  savings: number
}

// Дата в базе хранится как «2026-08-22», поэтому достаточно сравнить строки.
function isCurrentMonth(dateIso: string): boolean {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const prefix = `${now.getFullYear()}-${month}`

  return dateIso.startsWith(prefix)
}

function sumAmounts(items: { amount: number }[]): number {
  return items.reduce((total, item) => total + item.amount, 0)
}

// Один крючок, который собирает все данные для главного экрана.
// Ключи запросов те же, что и на других страницах, — данные переиспользуются.
export function useFinanceSummary() {
  const incomesQuery = useQuery({ queryKey: ['incomes'], queryFn: getIncomes })
  const expensesQuery = useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses,
  })
  const goalsQuery = useQuery({ queryKey: ['goals'], queryFn: getGoals })

  const incomes: Income[] = incomesQuery.data ?? []
  const expenses: Expense[] = expensesQuery.data ?? []
  const goals: Goal[] = goalsQuery.data ?? []

  const summary: FinanceSummary = {
    balance: sumAmounts(incomes) - sumAmounts(expenses),
    incomeThisMonth: sumAmounts(
      incomes.filter((income) => isCurrentMonth(income.date)),
    ),
    expenseThisMonth: sumAmounts(
      expenses.filter((expense) => isCurrentMonth(expense.date)),
    ),
    savings: goals.reduce((total, goal) => total + goal.current_amount, 0),
  }

  return {
    summary,
    incomes,
    expenses,
    goals,
    isPending:
      incomesQuery.isPending || expensesQuery.isPending || goalsQuery.isPending,
    isError: incomesQuery.isError || expensesQuery.isError || goalsQuery.isError,
  }
}