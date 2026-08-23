// Профиль пользователя. Идентификатор совпадает с идентификатором аккаунта.
export type Profile = {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  created_at: string
}

// Что можно изменить руками.
export type ProfileInput = {
  name: string
}