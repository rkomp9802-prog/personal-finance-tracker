import { supabase } from '@/services/supabase'
import type { Expense, ExpenseInput } from '@/types/expense'

const TABLE_NAME = 'expenses'

// Узнаём, кто сейчас работает с приложением.
async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    throw new Error('Не удалось определить пользователя. Войдите заново.')
  }

  return data.user.id
}

// Все расходы текущего пользователя, свежие сверху.
export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as Expense[]
}

// Добавить новый расход.
export async function createExpense(input: ExpenseInput): Promise<Expense> {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      user_id: userId,
      amount: input.amount,
      category: input.category,
      note: input.note,
      date: input.date,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Expense
}

// Изменить существующий расход.
export async function updateExpense(
  id: string,
  input: ExpenseInput,
): Promise<Expense> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({
      amount: input.amount,
      category: input.category,
      note: input.note,
      date: input.date,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Expense
}

// Удалить расход.
export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}