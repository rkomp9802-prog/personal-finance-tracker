import { supabase } from '@/services/supabase'
import type { Profile, ProfileInput } from '@/types/profile'

const TABLE_NAME = 'profiles'
const BUCKET_NAME = 'avatars'
const MAX_FILE_SIZE = 2 * 1024 * 1024

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    throw new Error('Не удалось определить пользователя. Войдите заново.')
  }

  return data.user.id
}

// Профиль текущего пользователя.
export async function getProfile(): Promise<Profile> {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Profile
}

// Меняем имя сразу в двух местах: в профиле и в данных аккаунта.
// Второе нужно, чтобы имя в шапке обновилось без перезагрузки.
export async function updateProfile(input: ProfileInput): Promise<Profile> {
  const userId = await getCurrentUserId()
  const name = input.name.trim()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ name })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: { name },
  })

  if (authError) {
    throw new Error(authError.message)
  }

  return data as Profile
}

// Загружаем картинку в свою папку и сохраняем ссылку на неё в профиле.
export async function uploadAvatar(file: File): Promise<Profile> {
  const userId = await getCurrentUserId()

  if (!file.type.startsWith('image/')) {
    throw new Error('profile.errors.notAnImage')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('profile.errors.tooLarge')
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  // Имя файла со временем, чтобы браузер не показывал старую картинку из кэша.
  const path = `${userId}/${Date.now()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, { upsert: true })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data: publicUrl } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ avatar_url: publicUrl.publicUrl })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Profile
}

// Убираем аватар: очищаем ссылку в профиле.
export async function removeAvatar(): Promise<Profile> {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ avatar_url: null })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Profile
}