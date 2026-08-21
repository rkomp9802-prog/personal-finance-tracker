import { supabase } from '@/services/supabase'
import type {
  ExpenseCategory,
  ExpenseCategoryInput,
} from '@/types/expenseCategory'

const TABLE_NAME = 'expense_categories'

// Код ошибки PostgreSQL «такая запись уже есть».
const DUPLICATE_CODE = '23505'

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    throw new Error('Не удалось определить пользователя. Войдите заново.')
  }

  return data.user.id
}

// Свои категории пользователя по алфавиту.
export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as ExpenseCategory[]
}

// Добавить свою категорию.
export async function createExpenseCategory(
  input: ExpenseCategoryInput,
): Promise<ExpenseCategory> {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      user_id: userId,
      name: input.name.trim(),
    })
    .select()
    .single()

  if (error) {
    // Дубликат показываем понятной фразой, а не текстом от базы.
    if (error.code === DUPLICATE_CODE) {
      throw new Error('expense.categoryExists')
    }

    throw new Error(error.message)
  }

  return data as ExpenseCategory
}

// Переименовать свою категорию.
export async function updateExpenseCategory(
  id: string,
  input: ExpenseCategoryInput,
): Promise<ExpenseCategory> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ name: input.name.trim() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === DUPLICATE_CODE) {
      throw new Error('expense.categoryExists')
    }

    throw new Error(error.message)
  }

  return data as ExpenseCategory
}

// Удалить свою категорию.
// Расходы, уже записанные в неё, останутся — у них категория хранится текстом.
export async function deleteExpenseCategory(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}