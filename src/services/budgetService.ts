import { supabase } from '@/services/supabase'
import type { Budget, BudgetInput, BudgetWithProgress } from '@/types/budget'
import type { Expense } from '@/types/expense'

const TABLE_NAME = 'budgets'

// Код ошибки PostgreSQL «такая запись уже есть».
const DUPLICATE_CODE = '23505'

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    throw new Error('Не удалось определить пользователя. Войдите заново.')
  }

  return data.user.id
}

// Все лимиты текущего пользователя.
export async function getBudgets(): Promise<Budget[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as Budget[]
}

// Создать лимит для категории.
export async function createBudget(input: BudgetInput): Promise<Budget> {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      user_id: userId,
      category: input.category,
      limit_amount: input.limit_amount,
    })
    .select()
    .single()

  if (error) {
    if (error.code === DUPLICATE_CODE) {
      throw new Error('budget.categoryExists')
    }

    throw new Error(error.message)
  }

  return data as Budget
}

// Изменить лимит.
export async function updateBudget(
  id: string,
  input: BudgetInput,
): Promise<Budget> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({
      category: input.category,
      limit_amount: input.limit_amount,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === DUPLICATE_CODE) {
      throw new Error('budget.categoryExists')
    }

    throw new Error(error.message)
  }

  return data as Budget
}

// Удалить лимит. Расходы при этом не трогаются.
export async function deleteBudget(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

// Сколько потрачено по каждой категории. Считается по всей истории расходов.
export function calculateSpentByCategory(
  expenses: Expense[],
): Record<string, number> {
  const totals: Record<string, number> = {}

  for (const expense of expenses) {
    totals[expense.category] = (totals[expense.category] ?? 0) + expense.amount
  }

  return totals
}

// Собираем лимиты вместе с подсчитанным расходом.
// Это чистая функция: та же пара списков всегда даёт тот же результат.
export function buildBudgetsWithProgress(
  budgets: Budget[],
  expenses: Expense[],
): BudgetWithProgress[] {
  const spentByCategory = calculateSpentByCategory(expenses)

  return budgets.map((budget) => {
    const spent = spentByCategory[budget.category] ?? 0
    const remaining = budget.limit_amount - spent
    const percent =
      budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0

    return {
      ...budget,
      spent,
      remaining,
      percent,
      isOverLimit: spent > budget.limit_amount,
    }
  })
}