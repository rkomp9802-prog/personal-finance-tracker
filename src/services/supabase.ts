import { createClient } from '@supabase/supabase-js'

// Адрес и публичный ключ проекта берутся из файла .env в корне проекта.
// В коде их значений нет и быть не должно.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Не заданы VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY. ' +
      'Проверьте файл .env в корне проекта и перезапустите npm run dev.',
  )
}

// Сколько живёт cookie с сессией — один год.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

// Максимальный размер одной cookie в браузере — около 4 КБ.
// Пропуск пользователя может быть длиннее, поэтому режем его на части.
const CHUNK_SIZE = 2000

function isSecureConnection(): boolean {
  return window.location.protocol === 'https:'
}

function writeCookie(name: string, value: string): void {
  const parts = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    'path=/',
    `max-age=${COOKIE_MAX_AGE}`,
    'SameSite=Lax',
  ]

  if (isSecureConnection()) {
    parts.push('Secure')
  }

  document.cookie = parts.join('; ')
}

function readCookie(name: string): string | null {
  const prefix = `${encodeURIComponent(name)}=`
  const all = document.cookie ? document.cookie.split('; ') : []

  for (const item of all) {
    if (item.startsWith(prefix)) {
      return decodeURIComponent(item.slice(prefix.length))
    }
  }

  return null
}

function deleteCookie(name: string): void {
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax`
}

function deleteAllParts(key: string): void {
  deleteCookie(key)

  let index = 0
  while (readCookie(`${key}.${index}`) !== null) {
    deleteCookie(`${key}.${index}`)
    index += 1
  }
}

// Наш «переходник»: Supabase просит хранилище с тремя действиями —
// прочитать, записать, удалить. Мы подсовываем ему cookies вместо памяти браузера.
const cookieStorage = {
  getItem(key: string): string | null {
    const whole = readCookie(key)
    if (whole !== null) {
      return whole
    }

    let result = ''
    let index = 0

    for (;;) {
      const part = readCookie(`${key}.${index}`)
      if (part === null) {
        break
      }
      result += part
      index += 1
    }

    return result.length > 0 ? result : null
  },

  setItem(key: string, value: string): void {
    deleteAllParts(key)

    if (value.length <= CHUNK_SIZE) {
      writeCookie(key, value)
      return
    }

    let index = 0
    for (let start = 0; start < value.length; start += CHUNK_SIZE) {
      writeCookie(`${key}.${index}`, value.slice(start, start + CHUNK_SIZE))
      index += 1
    }
  },

  removeItem(key: string): void {
    deleteAllParts(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: cookieStorage,
    storageKey: 'pft-auth',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})