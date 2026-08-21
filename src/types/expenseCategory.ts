// Своя категория расходов. Принадлежит конкретному пользователю.
export type ExpenseCategory = {
  id: string
  user_id: string
  name: string
  created_at: string
}

// Данные для создания или переименования категории.
export type ExpenseCategoryInput = {
  name: string
}