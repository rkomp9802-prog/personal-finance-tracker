import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'

type AuthContextValue = {
  session: Session | null
  user: User | null
  isLoading: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Этим крючком любая страница узнаёт, кто вошёл в систему.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth нужно использовать внутри <AuthProvider>')
  }

  return context
}

// Превращаем техническое сообщение Supabase в ключ перевода.
// Сам текст подставится на странице, на выбранном языке.
function toErrorKey(message: string): string {
  const dictionary: Record<string, string> = {
    'Invalid login credentials': 'auth.errors.invalidCredentials',
    'Email not confirmed': 'auth.errors.emailNotConfirmed',
    'User already registered': 'auth.errors.userExists',
    'Password should be at least 6 characters': 'auth.errors.weakPassword',
    'Unable to validate email address: invalid format':
      'auth.errors.invalidEmail',
  }

  return dictionary[message] ?? message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    // При запуске приложения спрашиваем: есть ли сохранённый пропуск в cookies?
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return
      }

      setSession(data.session)
      setIsLoading(false)
    })

    // Дальше слушаем все изменения: вход, выход, обновление пропуска.
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })

      if (error) {
        throw new Error(toErrorKey(error.message))
      }
    },
    [],
  )

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(toErrorKey(error.message))
    }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(toErrorKey(error.message))
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      signUp,
      signIn,
      signOut,
    }),
    [session, isLoading, signUp, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}