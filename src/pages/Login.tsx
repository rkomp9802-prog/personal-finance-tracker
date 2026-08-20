import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'

// Правила проверки полей. Проверка происходит до обращения к серверу.
const loginSchema = z.object({
  email: z.string().min(1, 'Введите email').email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function Login() {
  const { signIn, user, isLoading } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const state = location.state as { from?: string } | null
  const redirectTo = state?.from ?? '/'

  // Уже вошёл — незачем показывать форму входа.
  if (!isLoading && user) {
    return <Navigate to={redirectTo} replace />
  }

  async function onSubmit(values: LoginFormValues) {
    setFormError(null)

    try {
      await signIn(values.email, values.password)
      showToast('С возвращением!', 'success')
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось войти')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-slate-500">
            Personal Finance Tracker
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            С возвращением
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Вход в аккаунт</CardTitle>
            <CardDescription>
              Введите email и пароль, которые указывали при регистрации.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
              noValidate
            >
              {formError ? (
                <Alert variant="danger" title="Не удалось войти">
                  {formError}
                </Alert>
              ) : null}

              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Пароль"
                type="password"
                autoComplete="current-password"
                placeholder="Ваш пароль"
                error={errors.password?.message}
                {...register('password')}
              />

              <Button type="submit" fullWidth isLoading={isSubmitting}>
                Войти
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-sm text-slate-600">
          Нет аккаунта?{' '}
          <Link
            to="/register"
            className="font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}