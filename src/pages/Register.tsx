import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'

const registerSchema = z
  .object({
    name: z.string().min(2, 'validation.nameMin'),
    email: z
      .string()
      .min(1, 'validation.emailRequired')
      .email('validation.emailInvalid'),
    password: z.string().min(6, 'validation.passwordMin'),
    confirmPassword: z.string().min(1, 'validation.confirmRequired'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'validation.passwordsMismatch',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function Register() {
  const { signUp, user, isLoading } = useAuth()
  const { showToast } = useToast()
  const { t } = useTranslation()
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
      showToast(t('auth.signUpSuccess'), 'success')
      navigate('/', { replace: true })
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
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-center">
          <LanguageSwitcher />
        </div>

        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-slate-500">{t('app.name')}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {t('auth.createAccountHeading')}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('auth.registerTitle')}</CardTitle>
            <CardDescription>{t('auth.registerDescription')}</CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
              noValidate
            >
              {formError ? (
                <Alert variant="danger" title={t('auth.registerFailed')}>
                  {formError}
                </Alert>
              ) : null}

              <Input
                label={t('auth.name')}
                type="text"
                autoComplete="name"
                placeholder={t('auth.namePlaceholder')}
                error={errors.name ? t(errors.name.message ?? '') : undefined}
                {...register('name')}
              />

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
                autoComplete="new-password"
                placeholder={t('auth.newPasswordPlaceholder')}
                error={
                  errors.password ? t(errors.password.message ?? '') : undefined
                }
                {...register('password')}
              />

              <Input
                label={t('auth.confirmPassword')}
                type="password"
                autoComplete="new-password"
                placeholder={t('auth.confirmPasswordPlaceholder')}
                error={
                  errors.confirmPassword
                    ? t(errors.confirmPassword.message ?? '')
                    : undefined
                }
                {...register('confirmPassword')}
              />

              <Button type="submit" fullWidth isLoading={isSubmitting}>
                {t('auth.signUp')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-sm text-slate-600">
          {t('auth.haveAccount')}{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            {t('auth.loginLink')}
          </Link>
        </p>
      </div>
    </div>
  )
}