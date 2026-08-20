import { supabase } from '@/services/supabase'
import type { Income, IncomeInput } from '@/types/income'

const TABLE_NAME = 'incomes'

// Узнаём, кто сейчас работает с приложением.
// Его идентификатор проставляется в каждую новую строку.
async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    throw new Error('Не удалось определить пользователя. Войдите заново.')
  }

  return data.user.id
}

// Все доходы текущего пользователя, свежие сверху.
// Чужие строки база не отдаст даже при желании — их отрезает RLS.
export async function getIncomes(): Promise<Income[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as Income[]
}

// Добавить новый доход.
export async function createIncome(input: IncomeInput): Promise<Income> {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      user_id: userId,
      amount: input.amount,
      category: input.category,
      source: input.source,
      note: input.note,
      date: input.date,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Income
}

// Изменить существующий доход.
export async function updateIncome(
  id: string,
  input: IncomeInput,
): Promise<Income> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({
      amount: input.amount,
      category: input.category,
      source: input.source,
      note: input.note,
      date: input.date,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Income
}

// Удалить доход.
export async function deleteIncome(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}