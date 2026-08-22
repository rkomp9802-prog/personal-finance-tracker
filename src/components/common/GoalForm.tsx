import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Goal, GoalInput } from '@/types/goal'

function toNumber(value: string): number {
  const normalized = value.replace(/\s/g, '').replace(',', '.')
  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : 0
}

const goalFormSchema = z.object({
  title: z.string().min(1, 'goal.titleRequired'),
  targetAmount: z
    .string()
    .min(1, 'validation.amountRequired')
    .refine((value) => toNumber(value) > 0, 'validation.amountPositive'),
  currentAmount: z
    .string()
    .refine((value) => toNumber(value) >= 0, 'goal.currentInvalid'),
  deadline: z.string(),
})

type GoalFormValues = z.infer<typeof goalFormSchema>

type GoalFormProps = {
  initialValue?: Goal
  onSubmit: (input: GoalInput) => Promise<boolean>
  onCancel?: () => void
}

export function GoalForm({ initialValue, onSubmit, onCancel }: GoalFormProps) {
  const { t } = useTranslation()

  const emptyValues: GoalFormValues = {
    title: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: initialValue
      ? {
          title: initialValue.title,
          targetAmount: String(initialValue.target_amount),
          currentAmount: String(initialValue.current_amount),
          deadline: initialValue.deadline ?? '',
        }
      : emptyValues,
  })

  async function handleFormSubmit(values: GoalFormValues) {
    const isSaved = await onSubmit({
      title: values.title,
      target_amount: toNumber(values.targetAmount),
      current_amount: toNumber(values.currentAmount),
      deadline: values.deadline === '' ? null : values.deadline,
    })

    if (isSaved && !initialValue) {
      reset(emptyValues)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <Input
        label={t('goal.title')}
        type="text"
        placeholder={t('goal.titlePlaceholder')}
        error={errors.title ? t(errors.title.message ?? '') : undefined}
        {...register('title')}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label={t('goal.targetAmount')}
          type="text"
          inputMode="decimal"
          placeholder={t('goal.amountPlaceholder')}
          hint={t('goal.amountHint')}
          error={
            errors.targetAmount
              ? t(errors.targetAmount.message ?? '')
              : undefined
          }
          {...register('targetAmount')}
        />

        <Input
          label={t('goal.currentAmount')}
          type="text"
          inputMode="decimal"
          placeholder={t('goal.amountPlaceholder')}
          hint={t('goal.amountHint')}
          error={
            errors.currentAmount
              ? t(errors.currentAmount.message ?? '')
              : undefined
          }
          {...register('currentAmount')}
        />

        <Input
          label={t('goal.deadline')}
          type="date"
          hint={t('goal.deadlineHint')}
          error={errors.deadline ? t(errors.deadline.message ?? '') : undefined}
          {...register('deadline')}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          {t('goal.save')}
        </Button>

        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('goal.cancel')}
          </Button>
        ) : null}
      </div>
    </form>
  )
}