import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Moon, Sun } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { AvatarUploader } from '@/components/common/AvatarUploader'
import { ProfileForm } from '@/components/common/ProfileForm'
import { useTheme } from '@/context/ThemeContext'
import { supportedLanguages } from '@/i18n'
import {
  getProfile,
  removeAvatar,
  updateProfile,
  uploadAvatar,
} from '@/services/profileService'
import { cn } from '@/utils/cn'
import type { ProfileInput } from '@/types/profile'

// Одна кнопка в ряду переключателей настроек.
function OptionButton({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
      )}
    >
      {children}
    </button>
  )
}

export function Profile() {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const currentLanguage = i18n.resolvedLanguage ?? 'ru'

  const profileQuery = useQuery({ queryKey: ['profile'], queryFn: getProfile })

  function refreshProfile() {
    void queryClient.invalidateQueries({ queryKey: ['profile'] })
  }

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: refreshProfile,
  })

  const uploadMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: refreshProfile,
  })

  const removeMutation = useMutation({
    mutationFn: removeAvatar,
    onSuccess: refreshProfile,
  })

  // Сервис может вернуть ключ перевода вместо технического текста.
  function toMessage(error: unknown, fallbackKey: string): string {
    if (!(error instanceof Error)) {
      return t(fallbackKey)
    }

    return error.message.startsWith('profile.')
      ? t(error.message)
      : error.message
  }

  async function handleSave(input: ProfileInput): Promise<boolean> {
    try {
      await updateMutation.mutateAsync(input)
      showToast(t('profile.saved'), 'success')
      return true
    } catch (error) {
      showToast(toMessage(error, 'profile.saveError'), 'error')
      return false
    }
  }

  async function handleUpload(file: File) {
    try {
      await uploadMutation.mutateAsync(file)
      showToast(t('profile.avatarUploaded'), 'success')
    } catch (error) {
      showToast(toMessage(error, 'profile.avatarError'), 'error')
    }
  }

  async function handleRemove() {
    try {
      await removeMutation.mutateAsync()
      showToast(t('profile.avatarRemoved'), 'success')
    } catch (error) {
      showToast(toMessage(error, 'profile.avatarError'), 'error')
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {t('nav.profile')}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{t('pages.profile')}</p>
      </div>

      {profileQuery.isPending ? (
        <Skeleton className="h-72 w-full rounded-2xl" />
      ) : profileQuery.isError ? (
        <Alert variant="danger" title={t('profile.loadError')} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.personalData')}</CardTitle>
            <CardDescription>{t('profile.personalDataHint')}</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <AvatarUploader
              avatarUrl={profileQuery.data.avatar_url}
              fallbackText={
                profileQuery.data.name ?? profileQuery.data.email ?? '?'
              }
              isPending={uploadMutation.isPending}
              onSelectFile={(file) => void handleUpload(file)}
              onRemove={() => void handleRemove()}
            />

            <div className="border-t border-slate-100 pt-6">
              <ProfileForm profile={profileQuery.data} onSubmit={handleSave} />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.title')}</CardTitle>
          <CardDescription>{t('settings.description')}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900">
                {t('settings.appearance')}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {t('settings.appearanceHint')}
              </p>
            </div>

            <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5">
              <OptionButton
                isActive={theme === 'light'}
                onClick={() => setTheme('light')}
              >
                <Sun className="h-4 w-4" />
                {t('theme.light')}
              </OptionButton>

              <OptionButton
                isActive={theme === 'dark'}
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-4 w-4" />
                {t('theme.dark')}
              </OptionButton>
            </div>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4 border-t border-slate-100 pt-6">
            <div>
              <p className="text-sm font-medium text-slate-900">
                {t('settings.language')}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {t('settings.languageHint')}
              </p>
            </div>

            <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5">
              {supportedLanguages.map((language) => (
                <OptionButton
                  key={language.code}
                  isActive={currentLanguage === language.code}
                  onClick={() => {
                    void i18n.changeLanguage(language.code)
                  }}
                >
                  {language.name}
                </OptionButton>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}