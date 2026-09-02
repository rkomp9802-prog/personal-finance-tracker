import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'

// В правилах проверки лежат ключи переводов, а не готовые фразы.
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'validation.emailRequired')
    .email('validation.emailInvalid'),
  password: z.string().min(1, 'validation.passwordRequired'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function Login() {
  const { signIn, user, isLoading } = useAuth()
  const { showToast } = useToast()
  const { t } = useTranslation()
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

  if (!isLoading && user) {
    return <Navigate to={redirectTo} replace />
  }

  async function onSubmit(values: LoginFormValues) {
    setFormError(null)

    try {
      await signIn(values.email, values.password)
      showToast(t('auth.signInSuccess'), 'success')
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const raw = error instanceof Error ? error.message : ''
      setFormError(
        raw.startsWith('auth.errors.')
          ? t(raw)
          : raw || t('auth.errors.unknown'),
      )
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-center">
          <LanguageSwitcher />
        </div>

        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-muted-foreground">{t('app.name')}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {t('auth.welcomeBack')}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('auth.loginTitle')}</CardTitle>
            <CardDescription>{t('auth.loginDescription')}</CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
              noValidate
            >
              {formError ? (
                <Alert variant="danger" title={t('auth.loginFailed')}>
                  {formError}
                </Alert>
              ) : null}

              <Input
                label={t('auth.email')}
                type="email"
                autoComplete="email"
                placeholder={t('auth.emailPlaceholder')}
                error={errors.email ? t(errors.email.message ?? '') : undefined}
                {...register('email')}
              />

              <Input
                label={t('auth.password')}
                type="password"
                autoComplete="current-password"
                placeholder={t('auth.passwordPlaceholder')}
                error={
                  errors.password ? t(errors.password.message ?? '') : undefined
                }
                {...register('password')}
              />

              <Button type="submit" fullWidth isLoading={isSubmitting}>
                {t('auth.signIn')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-sm text-body">
          {t('auth.noAccount')}{' '}
          <Link
            to="/register"
            className="font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            {t('auth.registerLink')}
          </Link>
        </p>
      </div>
    </div>
  )
}