import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Profile, ProfileInput } from '@/types/profile'

const profileFormSchema = z.object({
  name: z.string().min(2, 'validation.nameMin'),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

type ProfileFormProps = {
  profile: Profile
  onSubmit: (input: ProfileInput) => Promise<boolean>
}

export function ProfileForm({ profile, onSubmit }: ProfileFormProps) {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: profile.name ?? '' },
  })

  async function handleFormSubmit(values: ProfileFormValues) {
    await onSubmit({ name: values.name })
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t('profile.name')}
          type="text"
          placeholder={t('profile.namePlaceholder')}
          error={errors.name ? t(errors.name.message ?? '') : undefined}
          {...register('name')}
        />

        <Input
          label={t('profile.email')}
          type="email"
          value={profile.email ?? ''}
          hint={t('profile.emailHint')}
          disabled
          readOnly
        />
      </div>

      <div>
        <Button type="submit" isLoading={isSubmitting}>
          {t('profile.save')}
        </Button>
      </div>
    </form>
  )
}