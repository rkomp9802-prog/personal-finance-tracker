// Цель накоплений.
// В отличие от бюджета, current_amount хранится в базе:
// вычислить его неоткуда, человек вводит его сам.
export type Goal = {
  id: string
  user_id: string
  title: string
  target_amount: number
  current_amount: number
  deadline: string | null
  created_at: string
}

// Данные для создания или изменения цели.
export type GoalInput = {
  title: string
  target_amount: number
  current_amount: number
  deadline: string | null
}