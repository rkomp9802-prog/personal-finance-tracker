// Лимит по категории. Как и у расхода, категория — текст:
// это может быть код базовой категории или название своей.
export type Budget = {
  id: string
  user_id: string
  category: string
  limit_amount: number
  created_at: string
}

// Данные для создания или изменения лимита.
export type BudgetInput = {
  category: string
  limit_amount: number
}

// Готовая строка для показа на экране.
// Ни spent, ни remaining в базе не хранятся — они считаются на лету.
export type BudgetWithProgress = Budget & {
  spent: number
  remaining: number
  percent: number
  isOverLimit: boolean
}