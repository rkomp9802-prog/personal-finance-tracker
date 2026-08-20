// Восемь категорий доходов из технического задания.
// Здесь лежат короткие коды, а человеческие названия — в словарях переводов.
export const incomeCategories = [
  'salary',
  'advance',
  'bonus',
  'sideJob',
  'sale',
  'gift',
  'investment',
  'other',
] as const

export type IncomeCategory = (typeof incomeCategories)[number]

// Так выглядит строка, пришедшая из базы.
export type Income = {
  id: string
  user_id: string
  amount: number
  category: IncomeCategory
  source: string | null
  note: string | null
  date: string
  created_at: string
}

// А так — данные, которые мы отправляем в базу при создании или изменении.
// Здесь нет id и user_id: их проставляют база и сервис.
export type IncomeInput = {
  amount: number
  category: IncomeCategory
  source: string | null
  note: string | null
  date: string
}