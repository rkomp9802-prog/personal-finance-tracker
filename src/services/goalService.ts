import { supabase } from '@/services/supabase'
import type { Goal, GoalInput } from '@/types/goal'

const TABLE_NAME = 'goals'

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    throw new Error('Не удалось определить пользователя. Войдите заново.')
  }

  return data.user.id
}

// Все цели текущего пользователя, свежие сверху.
export async function getGoals(): Promise<Goal[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as Goal[]
}

// Создать цель.
export async function createGoal(input: GoalInput): Promise<Goal> {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      user_id: userId,
      title: input.title.trim(),
      target_amount: input.target_amount,
      current_amount: input.current_amount,
      deadline: input.deadline,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Goal
}

// Изменить цель целиком.
export async function updateGoal(
  id: string,
  input: GoalInput,
): Promise<Goal> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({
      title: input.title.trim(),
      target_amount: input.target_amount,
      current_amount: input.current_amount,
      deadline: input.deadline,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Goal
}

// Пополнить цель: прибавить сумму к уже накопленной.
// Сначала читаем текущее значение, потом сохраняем новое.
export async function depositToGoal(
  id: string,
  amount: number,
): Promise<Goal> {
  const { data: existing, error: readError } = await supabase
    .from(TABLE_NAME)
    .select('current_amount')
    .eq('id', id)
    .single()

  if (readError) {
    throw new Error(readError.message)
  }

  const nextAmount = Number(existing.current_amount) + amount

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ current_amount: nextAmount })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Goal
}

// Удалить цель.
export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}