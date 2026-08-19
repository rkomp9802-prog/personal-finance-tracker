import { useEffect, useState } from 'react'
import { supabase } from './services/supabase'

type CheckStatus = 'checking' | 'ok' | 'error'

function App() {
  const [status, setStatus] = useState<CheckStatus>('checking')
  const [message, setMessage] = useState('Проверяем подключение к Supabase...')

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ error }) => {
        if (error) {
          setStatus('error')
          setMessage(error.message)
          return
        }

        cookieSelfTest()
        setStatus('ok')
        setMessage(
          'Клиент Supabase создан, ключи подхвачены, cookie-хранилище работает. ' +
            'Активной сессии пока нет — это нормально, вход мы ещё не сделали.',
        )
      })
      .catch((unknownError: unknown) => {
        setStatus('error')
        setMessage(
          unknownError instanceof Error
            ? unknownError.message
            : 'Неизвестная ошибка подключения',
        )
      })
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-slate-500">
          Personal Finance Tracker
        </p>

        <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          {status === 'checking' && 'Проверка...'}
          {status === 'ok' && 'Supabase подключён'}
          {status === 'error' && 'Подключение не удалось'}
        </p>

        <p className="mt-4 text-sm leading-relaxed text-slate-600">{message}</p>

        <div
          className={
            status === 'error'
              ? 'mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800'
              : 'mt-6 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600'
          }
        >
          Это временный экран. На следующих шагах он станет настоящим
          приложением.
        </div>
      </div>
    </div>
  )
}

// Записываем и тут же читаем тестовую cookie, чтобы убедиться,
// что браузер их не блокирует.
function cookieSelfTest(): void {
  document.cookie = 'pft-cookie-test=1; path=/; SameSite=Lax'
  const works = document.cookie.includes('pft-cookie-test=1')
  document.cookie = 'pft-cookie-test=; path=/; max-age=0; SameSite=Lax'

  if (!works) {
    console.warn('Браузер блокирует cookies — сессия сохраняться не будет.')
  }
}

export default App