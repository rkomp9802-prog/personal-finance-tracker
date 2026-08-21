// Семнадцать базовых категорий расходов из технического задания.
// Свои категории пользователя будут храниться отдельно, в базе.
export const baseExpenseCategories = [
  'groceries',
  'cafe',
  'transport',
  'taxi',
  'internet',
  'phone',
  'utilities',
  'rent',
  'loan',
  'subscriptions',
  'entertainment',
  'clothes',
  'pharmacy',
  'home',
  'travel',
  'pets',
  'other',
] as const

export type BaseExpenseCategory = (typeof baseExpenseCategories)[number]

// Проверка «это базовая категория или придуманная пользователем».
export function isBaseExpenseCategory(
  value: string,
): value is BaseExpenseCategory {
  return (baseExpenseCategories as readonly string[]).includes(value)
}

// Так выглядит строка, пришедшая из базы.
// category — обычный текст: там может быть и код базовой категории,
// и название своей, придуманной пользователем.
export type Expense = {
  id: string
  user_id: string
  amount: number
  category: string
  note: string | null
  date: string
  created_at: string
}

// А так — данные, которые мы отправляем в базу.
export type ExpenseInput = {
  amount: number
  category: string
  note: string | null
  date: string
}