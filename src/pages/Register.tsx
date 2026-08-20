import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
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

const registerSchema = z
  .object({
    name: z.string().min(2, 'Имя должно быть не короче 2 символов'),
    email: z.string().min(1, 'Введите email').email('Некорректный email'),
    password: z.string().min(6, 'Пароль должен быть не короче 6 символов'),
    confirmPassword: z.string().min(1, 'Повторите пароль'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function Register() {
  const { signUp, user, isLoading } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  if (!isLoading && user) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null)

    try {
      await signUp(values.email, values.password, values.name)
      showToast('Аккаунт создан', 'success')
      navigate('/', { replace: true })
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Не удалось зарегистрироваться',
      )
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
            Создать аккаунт
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Регистрация</CardTitle>
            <CardDescription>
              Займёт меньше минуты. Данные видны только вам.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
              noValidate
            >
              {formError ? (
                <Alert variant="danger" title="Не удалось зарегистрироваться">
                  {formError}
                </Alert>
              ) : null}

              <Input
                label="Имя"
                type="text"
                autoComplete="name"
                placeholder="Как к вам обращаться"
                error={errors.name?.message}
                {...register('name')}
              />

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
                autoComplete="new-password"
                placeholder="Минимум 6 символов"
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Повторите пароль"
                type="password"
                autoComplete="new-password"
                placeholder="Ещё раз тот же пароль"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button type="submit" fullWidth isLoading={isSubmitting}>
                Создать аккаунт
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-sm text-slate-600">
          Уже есть аккаунт?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}